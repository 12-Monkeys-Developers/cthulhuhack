export class GMManager extends Application {
  static GM_MANAGER = "gm-manager";
  static GM_MANAGER_TEMPLATE = "systems/cthack/templates/app/gm-manager.hbs";

  constructor() {
    super({ id: GMManager.GM_MANAGER });
    Hooks.on("updateSetting", async (setting, update, options, id) => this.updateManager(setting, update, options, id));
    Hooks.on("updateActor", async (setting, update, options, id) => this.updateManager(setting, update, options, id));
    Hooks.on("renderPlayerList", async (setting, update, options, id) => this.updateManager(setting, update, options, id));
    Hooks.once("ready", () => this.onReady());
  }

  async updateManager(setting, update, options, id) {
    game.cthack.gmManager.render(false);
  }

  onReady() {
    if (game.user.isGM) {
      game.cthack.gmManager.render(true);
    }
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: GMManager.GM_MANAGER_TEMPLATE,
      classes: ["cthack", "gm-manager"],
      title: game.i18n.localize("GMMANAGER.Title"),
      top: 100,
      left: 120,
      width: 1200,
      height: "auto",
      resizable: true,
    });
  }

  getData() {
    const context = super.getData();
    context.players = game.users.filter((u) => u.hasPlayerOwner && u.active);

    const misc = game.settings.get("cthack", "MiscellaneousResource");
    const healthDisplay = game.settings.get("cthack", "HealthDisplay");
    const wealth = game.settings.get("cthack", "Wealth");

    context.hasMisc = misc !== "";
    context.hasHP = healthDisplay === "hp" || healthDisplay === "both";
    context.hasHD = healthDisplay === "hd" || healthDisplay === "both";
    context.hasWealthResource = wealth === "resource";
    context.hasWealthFixed = wealth === "fixed";

    return context;
  }

  render(force = false, options = {}) {
    if (game.user.isGM) {
      return super.render(force, options);
    }
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".gm-resource-all").click(this._onRessourceRollForAll.bind(this));
    html.find(".gm-save-all").click(this._onSaveRollForAll.bind(this));
    html.find(".gm-resource-individual").click(this._onRessourceRollIndividual.bind(this));
    html.find(".gm-save-individual").click(this._onSaveRollIndividual.bind(this));
    html.find(".gm-character").click(this._onCharacter.bind(this));
  }

  /**
   * @description Ask all players to make a roll for the selected Resource
   * @param {*} event
   * @returns
   */
  async _onRessourceRollForAll(event) {
    event.preventDefault();
    const resource = event.currentTarget.dataset.resource;
    if (resource == "Adrenaline") return;
    let label;
    if (resource == "Miscellaneous") {
      label = game.settings.get("cthack", "MiscellaneousResource");
    } else {
      label = game.i18n.localize("CTHACK." + resource);
    }

    const text = game.i18n.format("CHAT.AskRollForAll", { resource: label });

    ChatMessage.create({
      user: game.user.id,
      content: await renderTemplate(`systems/cthack/templates/chat/gm-manager-ask-roll.hbs`, {
        text: text,
        rollType: "resource",
        resource: resource,
      }),
    });
  }

  /**
   * @description Ask all players to make a roll for the selected Save
   * @param {*} event
   * @returns
   */
  async _onSaveRollForAll(event) {
    event.preventDefault();
    const save = event.currentTarget.dataset.save;
    const text = game.i18n.format("CHAT.AskRollForAll", { resource: game.i18n.localize("CTHACK.Save" + save) });

    ChatMessage.create({
      user: game.user.id,
      content: await renderTemplate(`systems/cthack/templates/chat/gm-manager-ask-roll.hbs`, {
        text: text,
        rollType: "save",
        resource: save,
      }),
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    });
  }

  /**
   * @description Ask a specific player to make a roll for the selected Resource
   * @param {*} event
   * @returns
   */
  async _onRessourceRollIndividual(event) {
    event.preventDefault();
    const resource = event.currentTarget.dataset.resource;
    if (resource == "Adrenaline") return;
    let label;
    if (resource == "Miscellaneous") {
      label = game.settings.get("cthack", "MiscellaneousResource");
    } else {
      label = game.i18n.localize("CTHACK." + resource);
    }

    const recipient = event.currentTarget.parentElement.dataset.userId;
    const name = event.currentTarget.parentElement.dataset.characterName;
    const text = game.i18n.format("CHAT.AskRollIndividual", { name: name, resource: label });

    game.socket.emit("system.cthack", { msg: "msg_ask_roll", data: { userId: recipient } });

    ChatMessage.create({
      user: game.user.id,
      content: await renderTemplate(`systems/cthack/templates/chat/gm-manager-ask-roll.hbs`, {
        text: text,
        rollType: "resource",
        resource: resource,
      }),
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      whisper: [recipient],
    });
  }

  /**
   * @description Ask a specific player to make a roll for the selected Save
   * @param {*} event
   * @returns
   */
  async _onSaveRollIndividual(event) {
    event.preventDefault();
    const save = event.currentTarget.dataset.save;
    const recipient = event.currentTarget.parentElement.dataset.userId;
    const name = event.currentTarget.parentElement.dataset.characterName;
    const text = game.i18n.format("CHAT.AskRollIndividual", { name: name, resource: game.i18n.localize("CTHACK.Save" + save) });

    game.socket.emit("system.cthack", { msg: "msg_ask_roll", data: { userId: recipient } });

    ChatMessage.create({
      user: game.user.id,
      content: await renderTemplate(`systems/cthack/templates/chat/gm-manager-ask-roll.hbs`, {
        text: text,
        rollType: "save",
        resource: save,
      }),
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      whisper: [recipient],
    });
  }

  /**
   * @description Click on a character to open its sheet
   * @param {*} event
   * @returns
   */
  async _onCharacter(event) {
    event.preventDefault();
    const characterId = event.currentTarget.parentElement.dataset.characterId;
    const actor = game.actors.get(characterId);
    actor.sheet.render(true);
  }
}
