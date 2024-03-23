import { formatDate } from "../../utils.js";

/**
 * @extends {ActorSheet}
 */
export default class CtHackCharacterSheetV2 extends ActorSheet {
  //#region Overrided methods
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cthack", "sheet", "actor", "character-v2"],
      width: 1100,
      height: 860,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "items" }],
      dragDrop: [{ dragSelector: ".items-list .item", dropSelector: null }],
    });
  }

  /** @override */
  get template() {
    return "systems/cthack/templates/sheets/character-v2.hbs";
  }

  /** @override */
  async getData(options) {
    const context = super.getData(options);

    // By using isEditable, it will allow the automatic configuration to disabled on all input, select and textarea
    context.editable = this.actor.isUnlocked;
    context.uneditable = !this.actor.isUnlocked;

    context.abilities = [];
    const abilitiesRaw = this.actor.itemTypes.ability;
    for (const item of abilitiesRaw) {
      item.enrichedDescription = await TextEditor.enrichHTML(item.system.description, { async: true });
      context.abilities.push(item);
    }

    context.magics = [];
    const magicsRaw = this.actor.itemTypes.magic;
    for (const item of magicsRaw) {
      item.enrichedDescription = await TextEditor.enrichHTML(item.system.description, { async: true });
      context.magics.push(item);
    }

    context.weapons = [];
    const weaponsRaw = this.actor.itemTypes.weapon;
    for (const item of weaponsRaw) {
      item.enrichedDescription = await TextEditor.enrichHTML(item.system.description, { async: true });
      context.weapons.push(item);
    }
  
    context.otheritems = [];
    const otheritemsRaw = this.actor.itemTypes.item;
    for (const item of otheritemsRaw) {
      item.enrichedDescription = await TextEditor.enrichHTML(item.system.description, { async: true });
      context.otheritems.push(item);
    }

    context.conditions = [];
    const conditionsRaw = this.actor.itemTypes.definition;
    for (const item of conditionsRaw) {
      item.enrichedDescription = await TextEditor.enrichHTML(item.system.description, { async: true });
      context.conditions.push(item);
    }

    context.enrichedBiography = await TextEditor.enrichHTML(this.actor.system.biography, { async: true });
    context.enrichedNotes = await TextEditor.enrichHTML(this.actor.system.notes, { async: true });
    context.enrichedEquipment = await TextEditor.enrichHTML(this.actor.system.equipment, { async: true });

    context.isGm = game.user.isGM;
    context.hasImage = this.actor.hasImage;

    context.system = this.actor.system;

    context.dicesDamage = SYSTEM.DICES_DAMAGE;
    context.dicesValue = SYSTEM.DICES_VALUE;
    context.dicesMax = SYSTEM.DICES_MAX;

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".sheet-lock").click(this._onSheetLock.bind(this));

    // Add, Edit or Delete Inventory
    html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });
    html.find(".item-delete").click(this._onItemDelete.bind(this));

    // Add, Edit, Delete or Use Ability Item
    html.find(".ability-create").click(this._onItemCreate.bind(this));

    // Saving throws
    html.find(".save-name").click(this._onSaveRoll.bind(this));

    // Resource roll
    html.find(".resource-name").click(this._onResourceRoll.bind(this));

    // Armed and unarmed damage rolls
    html.find(".armed-damage-name").click(this._onDamagedRoll.bind(this));
    html.find(".unarmed-damage-name").click(this._onDamagedRoll.bind(this));

    // Wealth roll if the option is enabled
    if (game.settings.get("cthack", "Wealth") == "resource") {
      html.find(".wealth-name").click(this._onResourceRoll.bind(this));
    }

    // HitDice roll if the option is enabled
    if (game.settings.get("cthack", "HitDiceResource")) {
      html.find(".hit-name").click(this._onResourceRoll.bind(this));
    }

    // Miscellaneous roll if the option is enabled
    if (game.settings.get("cthack", "MiscellaneousResource")) {
      html.find(".miscellaneous-name").click(this._onResourceRoll.bind(this));
    }

    // Fortune option
    html.find(".fortune-use").click(this._onFortuneUse.bind(this));

    // Adrenaline option
    html.find("#adr1").click(this._onAdrenalineUse.bind(this));
    html.find("#adr2").click(this._onAdrenalineUse.bind(this));

    // Roll for item in inventory
    html.find(".fa-dice-d20").click(this._onMaterialRoll.bind(this));

    // Change item dice value in inventory
    html.find(".item-dice").change((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      const selectName = "[name='" + item.id + "']";
      const newValue = html.find(selectName)[0].value;
      const update = { _id: item.id, "data.dice": newValue };
      this.actor.updateEmbeddedDocuments("Item", [update]);
    });

	html.find(".share-image").click(this._onShareImage.bind(this));

    // Activate context menu
    this._contextCharacterMenu(html);
  }

  _contextCharacterMenu(html) {
    ContextMenu.create(this, html, ".character-contextmenu", this._getEntryContextOptions());
  }

  _getEntryContextOptions() {
    return [
      {
        name: game.i18n.localize("CTHACK.ContextMenuUse"),
        icon: '<i class="fas fa-check"></i>',
        condition: (li) => {
          const item = this.actor.items.get(li.data("item-id"));
          return item.isOwner && item.type === "ability" && item.system.isUsable;
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
          return item.isOwner && item.type === "ability" && item.system.isResetable;
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
          return item.isOwner && item.type === "ability" && item.system.isDecreaseable;
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
          const key = item.system.key;
          switch (item.type) {
            case "ability":
              await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
              await this.actor.deleteAbility(key, item.id);
              break;
            case "definition":
              await this.actor.deleteEffectFromItem(item);
              await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
              break;
            default:
              await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
              break;
          }
        },
      },
    ];
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
	  
  /** @override */
  async _onDropItemCreate(itemData) {
    switch (itemData.type) {
      case "archetype":
        return await this._onDropArchetypeItem(itemData);
      case "ability":
        return await this._onDropAbilityItem(itemData);
      case "item":
      case "weapon":
      case "magic":
        return await this._onDropStandardItem(itemData);
      case "definition":
        return await this._onDropDefinitionItem(itemData);
      default:
        return;
    }
  }
  //#endregion

  //#region Private methods

  /**
   * @name _onItemCreate
   * @description Creates a new Owned Item for the actor using type defined in the HTML dataset
   *
   * @private
   *
   * @param {Event} event   The originating click event
   *
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const li = event.currentTarget;
    // Get the type of item to create.
    let type;
    event?.shiftKey ? (type = li.dataset.altType) : (type = li.dataset.type);

    // Initialize a default name.
    const name = game.i18n.format("CTHACK.ItemNew", { type: game.i18n.localize(`CTHACK.ItemType${type.capitalize()}`) });
    // Prepare the item object
    const itemData = {
      name: name,
      type: type,
    };

    // Create the item
    return await this.actor.createEmbeddedDocuments("Item", [itemData], { renderSheet: true });
  }

  /**
   * @name _onItemDelete
   * @description Callback on delete item actions
   * 				The result depends on the data type
   * @private
   *
   * @param {Event} event   The originating click event
   *
   */

  async _onItemDelete(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item");
    const itemId = li.data("itemId");
    const item = this.actor.items.find((item) => item.id === itemId);
    const key = item.system.key;
    li.slideUp(200, () => this.render(false));

    switch (item.type) {
      case "item":
        await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
        break;
      case "ability":
        await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
        await this.actor.deleteAbility(key, itemId);
        break;
      case "definition":
        await this.actor.deleteEffectFromItem(item);
        await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
        break;
      default:
        await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
        break;
    }
  }

  /**
   * @name _onSaveRoll
   * @description Callback on Save roll
   * @private
   *
   * @param {Event} event   The originating click event
   *
   */
  _onSaveRoll(event) {
    event.preventDefault();
    let save = event.currentTarget.parentElement.dataset.save;
    this.actor.rollSave(save, { event: event });
  }

  /**
   * @name _onResourceRoll
   * @description Callback on Resource roll
   * @private
   *
   * @param {Event} event   The originating click event
   *
   */
  async _onResourceRoll(event) {
    event.preventDefault();
    let resource = event.currentTarget.dataset.resource;

    await this.actor.rollResource(resource, { event: event });

    // Render to refresh in case of resource lost
    this.actor.sheet.render(true);
  }

  /**
   * @name _onMaterialRoll
   * @description Callback on Material roll
   * @private
   *
   * @param {Event} event   The originating click event
   *
   */
  async _onMaterialRoll(event) {
    event.preventDefault();

    const li = $(event.currentTarget).parents(".item");
    const itemId = li.data("item-id");
    let item = this.actor.items.get(itemId);

    await this.actor.rollMaterial(item, { event: event });

    // Render to refresh in case of resource lost
    this.actor.sheet.render(true);
  }

  /**
   * @name _onDamagedRoll
   * @description Callback on Damaged roll
   * @private
   *
   * @param {Event} event   The originating click event
   *
   */
  _onDamagedRoll(event) {
    event.preventDefault();
    const damage = event.currentTarget.dataset.resource;
    this.actor.rollDamageRoll(damage, { event: event });
  }

  /**
   * @name _onDropStandardItem
   * @description Handles dropping of an item reference or item data onto an Actor Sheet
   * 				Handles weapon and item types for character, and attack for opponent
   * @private
   *
   * @param {Object} data   The data transfer extracted from the event
   * Item of type 'attack' for npc, 'item', 'weapon', 'magic'for pc
   * @return {Object} EmbeddedDocument Item data to create
   */
  async _onDropStandardItem(data) {
    if (!this.actor.isOwner) return false;

    // Create the owned item
    return await this.actor.createEmbeddedDocuments("Item", [data], { renderSheet: false });
  }

  /**
   * Handle dropping of an item reference or item data of type definition onto an Actor Sheet
   * @param {Object} data         The data transfer extracted from the event
   * @return {Object}             EmbeddedDocument Item to create
   * @private
   */
  async _onDropDefinitionItem(data) {
    if (!this.actor.isOwner) return false;

    const itemData = foundry.utils.deepClone(data);
    itemData.system.creationDate = formatDate(new Date());

    return this.actor.createDefinitionItem(itemData);
  }

  /**
   * Handle dropping of an archetype onto an Actor Sheet
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @private
   */
  _onDropArchetypeItem(itemData) {
    // Replace actor data
    this.actor.update({
      "system.archetype": itemData.name,
      "system.attributes.flashlights": { value: itemData.system.flashlights, max: itemData.system.flashlights },
      "system.attributes.smokes": { value: itemData.system.smokes, max: itemData.system.smokes },
      "system.attributes.sanity": { value: itemData.system.sanity, max: itemData.system.sanity },
      "system.attributes.hitDice": { value: itemData.system.hitdice },
      "system.attributes.wealthDice": { value: itemData.system.wealthDice },
      "system.attributes.armedDamage": { value: itemData.system.armeddamage },
      "system.attributes.unarmedDamage": { value: itemData.system.unarmeddamage },
    });
    this.actor.sheet.render(true);
  }

  /**
   * Handle dropping of an ability Item onto an Actor Sheet
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @private
   */
  async _onDropAbilityItem(itemData) {
    const id = itemData._id;
    const key = itemData.system.key;
    const multiple = itemData.system.multiple;

    let abilitiesList = this.actor.system.abilities;

    if (multiple) {
      if (!this._hasAbility(key, abilitiesList)) {
        abilitiesList.push({ key: key, id: id });
        await this.actor.update({ "system.abilities": abilitiesList });
      }
      return await this.actor.createEmbeddedDocuments("Item", [itemData], { renderSheet: false });
    } else {
      if (!this._hasAbility(key, abilitiesList)) {
        abilitiesList.push({ key: key, id: id });
        await this.actor.update({ "system.abilities": abilitiesList });
        return await this.actor.createEmbeddedDocuments("Item", [itemData], { renderSheet: false });
      } else return;
    }
  }

  /**
   * Check if the ability is already owned based on key
   * @param {String} key      The key to find
   * @param {String[]} abilitiesList   All owned abilities
   * @private
   */
  _hasAbility(key, abilitiesList) {
    for (let ability of abilitiesList) {
      if (key === ability.key) {
        return true;
      }
    }
    return false;
  }

  /**
   * Reduce the Fortune value by 1 (GM only)
   * @param {Event} event   The originating click event
   * @private
   */
  _onFortuneUse(event) {
    event.preventDefault();
    if (game.user.isGM) {
      const currentValue = game.settings.get("cthack", "FortuneValue");
      const newValue = currentValue - 1;

      if (currentValue > 0) {
        game.settings.set("cthack", "FortuneValue", newValue);
        //this.actor.sheet.render(true);
        ChatMessage.create({
          user: game.user.id,
          //speaker: ChatMessage.getSpeaker({user: game.user}),
          content: game.i18n.format("CTHACK.FortuneUseMessage", { name: this.actor.name, total: newValue }),
        });
      }

      /*
			if (currentValue > 0) {
				const newValue = currentValue - 1;
				let data = {
					value: newValue
				};
				game.socket.emit("system.cthack", { msg: "msg_use_fortune", data: data});
			}
			*/
    }
  }

  /**
   * Toggle adrenaline 1
   * @param {Event} event   The originating click event
   * @private
   */
  _onAdrenalineUse(event) {
    event.preventDefault();
    const adr = event.currentTarget.id;
    if (adr === "adr1") {
      const value = this.actor.system.attributes.adrenaline1.value;
      let newData = { value: "pj" };
      if (value === "pj") {
        newData = { value: "mj" };
      }
      this.actor.update({ "data.attributes.adrenaline1": newData });
    } else if (adr === "adr2") {
      const value = this.actor.system.attributes.adrenaline2.value;
      let newData = { value: "pj" };
      if (value === "pj") {
        newData = { value: "mj" };
      }
      this.actor.update({ "data.attributes.adrenaline2": newData });
    }
    this.actor.sheet.render(true);
  }

  //#endregion

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
