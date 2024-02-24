import { SYSTEM } from "../config/system.mjs";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CtHackOpponentSheetV2 extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cthack", "sheet", "actor", "opponentv2"],
      width: 430,
      height: 700,
      dragDrop: [{ dragSelector: ".items-list .item", dropSelector: null }],
    });
  }

  /* -------------------------------------------- */

  /** @override */
  get template() {
    return "systems/cthack/templates/actor/opponent-sheet-2.hbs";
  }

  get isEditable() {
    return super.isEditable && this.actor.isUnlocked;
  }

  /** @override */
  async getData(options) {
    const context = super.getData(options);

    context.editable = this.isEditable;
    context.attacks = this.actor.itemTypes.attack;
    context.magics = [];
    const magicsRaw = this.actor.itemTypes.magic;
    for (const magic of magicsRaw) {
      const desc = await TextEditor.enrichHTML(magic.system.description, { async: true });
      context.magics.push({desc: desc, item: magic});
    }

    context.opponentAbilities = [];
    const opponentAbilitiesRaw = this.actor.itemTypes.opponentAbility;
    for (const ability of opponentAbilitiesRaw) {
      const desc = await TextEditor.enrichHTML(ability.system.description, { async: true });
      context.opponentAbilities.push({desc: desc, item: ability});
    }

    context.enrichedDescription = await TextEditor.enrichHTML(this.actor.system.description, { async: true });
    context.hasImage = this.actor.img && this.actor.img !== "icons/svg/mystery-man.svg";
    context.hasShortDescription = !!this.actor.system.description;
    context.opponentHitDice = SYSTEM.OPPONENT_HIT_DICE;

    return context;
  }

  /** @override */
  async _onDropItem(event, data) {
    if (!this.isEditable) return false;
    const item = await fromUuid(data.uuid);
    // Only magic and attack items can be dropped
    if (["archetype", "ability", "item", "weapon", "definition"].includes(item.type)) return false;
    else return super._onDropItem(event, data);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".sheet-lock").click(this._onSheetLock.bind(this));

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Item summaries
    html.find(".item .item-name h4").click((event) => this._onItemSummary(event));

    html.find(".attack-create").click(this._onAttackCreate.bind(this));

    html.find(".attack-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    html.find(".attack-delete").click(this._onAttackDelete.bind(this));

    html.find(".selectHitDice").change(this._onChangeHitDice.bind(this));

    // Roll for attack
    html.find(".fa-dice-d20.attack").click(this._onAttackDamageRoll.bind(this));
    // Roll for magic
    html.find(".fa-dice-d20.magic").click(this._onMagicRoll.bind(this));

    // Activate context menu
    this._contextOpponentMenu(html);

    html.find(".image").click(this._onShareImage.bind(this));
    html.find(".editable-image").on("contextmenu", this._resetImage.bind(this));
    html.find(".name").on("contextmenu", this._onSearchActor.bind(this));
  }

  _contextOpponentMenu(html) {
    ContextMenu.create(this, html, ".opponent-contextmenu", this._getEntryContextOptions());
  }

  _getEntryContextOptions() {
    return [
      {
        name: game.i18n.localize("CTHACK.ContextMenuUse"),
        icon: '<i class="fas fa-check"></i>',
        condition: (li) => {
          const item = this.actor.items.get(li.data("item-id"));
          return item.isOwner && item.type === "opponentAbility" && item.system.isUsable;
        },
        callback: (li) => {
          const item = this.actor.items.get(li.data("item-id"));
          item.system.use();
          this.render();
        },
      },
      {
        name: game.i18n.localize("CTHACK.ContextMenuResetUse"),
        icon: '<i class="fa-solid fa-0"></i>',
        condition: (li) => {
          const item = this.actor.items.get(li.data("item-id"));
          return item.isOwner && item.type === "opponentAbility" && item.system.isResetable;
        },
        callback: (li) => {
          const item = this.actor.items.get(li.data("item-id"));
          item.system.resetUse();
          this.render();
        },
      },
      {
        name: game.i18n.localize("CTHACK.ContextMenuDecreaseUse"),
        icon: '<i class="fa-solid fa-minus"></i>',
        condition: (li) => {
          const item = this.actor.items.get(li.data("item-id"));
          return item.isOwner && item.type === "opponentAbility" && item.system.isDecreaseable;
        },
        callback: (li) => {
          const item = this.actor.items.get(li.data("item-id"));
          item.system.decrease();
          this.render();
        },
      },      
      {
        name: game.i18n.localize("CTHACK.ContextMenuEdit"),
        icon: '<i class="fas fa-edit"></i>',
        condition: (li) => {
          const item = this.actor.items.get(li.data("item-id"));
          return item.isOwner;
        },
        callback: (li) => {
          const item = this.actor.items.get(li.data("item-id"));
          item.sheet.render(true);
        },
      },
      {
        name: game.i18n.localize("CTHACK.ContextMenuDelete"),
        icon: '<i class="fas fa-trash"></i>',
        condition: (li) => {
          const item = this.actor.items.get(li.data("item-id"));
          return item.isOwner;
        },
        callback: async (li) => {
          const item = this.actor.items.get(li.data("item-id"));
          await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
        },
      }
    ];
  }

  /**
   * Handles the event when a magic roll is triggered.
   * @param {Event} event - The event object.
   * @returns {Promise<void>} - A promise that resolves when the function finishes executing.
   */
  async _onMagicRoll(event) {
    event.preventDefault();

    const li = $(event.currentTarget).parents(".item-dice");
    const itemId = li.data("item-id");
    let item = this.actor.items.get(itemId);

    await this.actor.rollMaterial(item, { event: event });

    // Render to refresh in case of resource lost
    this.actor.sheet.render(true);
  }

  /**
   * Handles the event when sharing an image.
   * 
   * @param {Event} event - The event object.
   * @returns {void}
   */
  _onShareImage(event) {
    event.preventDefault();
    const imagePath = event.currentTarget.dataset.image;
    const characterName = event.currentTarget.dataset.name;

    const ip = new ImagePopout(imagePath, { title: characterName });

    // Display the image popout
    ip.render(true);
  }

  /**
   * Handles the search event for an actor.
   * @param {Event} event - The search event.
   * @returns {Promise<void>} - A promise that resolves when the search is complete.
   */
  async _onSearchActor(event) {
    event.preventDefault();
    const characterName = event.currentTarget.dataset.name;
    await this.patternSearch(characterName);
  }

  /**
   * Resets the image of the opponent sheet.
   * @param {Event} event - The event object.
   * @returns {Promise<void>} - A promise that resolves when the image is reset.
   */
  async _resetImage(event) {
    event.preventDefault();
    await this.actor.update({ 'img': "icons/svg/mystery-man.svg" });
  }

  /**
   * Searches for a pattern in the game journal and displays the search result in the chat.
   * @param {string} searchPattern - The pattern to search for.
   * @returns {Promise<void>} - A promise that resolves when the search result is displayed in the chat.
   */
  async patternSearch(searchPattern) {
    let resultCollection = [];
    game.journal.forEach((doc) => {
      resultCollection.push(...doc.pages.search({ query: searchPattern }));
    });

    const htmlChat = await renderTemplate("systems/cthack/templates/chat/search-result.hbs", {
      resultCollection: resultCollection,
      pattern: searchPattern,
    });
    const chatData = {
      content: htmlChat,
      whisper: [game.user],
    };
    ChatMessage.create(chatData);
    return;
  }

  /**
   * Handles the change on the HitDice value
   * @param {*} event The originating change event
   */
  async _onChangeHitDice(event) {
    const newHitDiceValue = parseInt(event.currentTarget.value);
    const newHpMax = 4 * newHitDiceValue;
    const newArmorMalusValue = -1 * (newHitDiceValue - 1);
    await this.actor.update({
      "system.hitDice": newHitDiceValue,
      "system.hp.value": newHpMax,
      "system.hp.max": newHpMax,
      "system.malus": newArmorMalusValue,
    });
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onAttackCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Initialize a default name.
    const name = game.i18n.format("CTHACK.ItemNew", { type: game.i18n.localize(`CTHACK.ItemType${type.capitalize()}`) });
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
    };
    // Finally, create the item!
    return await this.actor.createEmbeddedDocuments("Item", [itemData], { renderSheet: true });
  }

  /**
   * Handle deleting a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onAttackDelete(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item");
    const itemId = li.data("itemId");
    li.slideUp(200, () => this.render(false));
    return this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  /**
   * Handle toggling of an item from the Opponent sheet
   * @private
   */
  _onItemSummary(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents(".item"),
      item = this.actor.items.get(li.data("item-id"));

    // Toggle summary
    if (item.system.description !== undefined && item.system.description !== null) {
      if (li.hasClass("expanded")) {
        let summary = li.children(".item-summary");
        summary.slideUp(200, () => summary.remove());
      } else {
        let div = $(`<div class="item-summary">${item.system.description}</div>`);
        li.append(div.hide());
        div.slideDown(200);
      }
      li.toggleClass("expanded");
    }
  }

  /**
   * Handle clickable Damaged roll.
   * @param {Event} event   The originating click event
   * @private
   */
  _onAttackDamageRoll(event) {
    const li = $(event.currentTarget).parents(".item-details");
    const itemId = li.data("itemId");
    let item = this.actor.items.get(itemId);

    this.actor.rollAttackDamageRoll(item, { event: event });
  }

  /**
   * Lock or unlock the sheet
   * @param {*} event
   */
  async _onSheetLock(event) {
    event.preventDefault();
    let flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked");
    if (flagData) await this.actor.unsetFlag(game.system.id, "SheetUnlocked");
    else await this.actor.setFlag(game.system.id, "SheetUnlocked", "SheetUnlocked");
    this.actor.sheet.render(true);
  }
}
