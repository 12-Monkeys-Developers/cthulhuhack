import { formatDate } from "../../utils.mjs"
import { SearchChat } from "../research.mjs"

/**
 * @extends {ActorSheet}
 */
export default class CtHackCharacterSheet extends foundry.appv1.sheets.ActorSheet {
  //#region Overrided methods

  // Variable to check if the appV1 is used : will remove warning
  // To migrate before V16
  static _warnedAppV1 = true

  constructor(options) {
    super(options)
    Hooks.on("updateSetting", async (document, change, options, userId) => {
      if (document.key === "cthack.FortuneValue") {
        this.render()
      }
    })
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cthack", "sheet", "actor", "character"],
      width: 1100,
      height: 860,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "items" }],
      dragDrop: [{ dragSelector: '.items-list .item, [data-drag="true"]', dropSelector: null }],
    })
  }

  /** @override */
  get template() {
    return "systems/cthack/templates/sheets/character.hbs"
  }

  /** @inheritdoc */
  _onDragStart(event) {
    if ("link" in event.target.dataset) return

    const li = event.currentTarget

    // Create drag data
    let dragData

    // Owned Items
    if (li.dataset.itemId) {
      const item = this.actor.items.get(li.dataset.itemId)
      dragData = item.toDragData()
    }

    // Active Effect
    if (li.dataset.effectId) {
      const effect = this.actor.effects.get(li.dataset.effectId)
      dragData = effect.toDragData()
    }

    if (!dragData) {
      const el = event.currentTarget.closest('[data-drag="true"]')
      const dataset = el.dataset
      const dragType = dataset.dragType

      let target
      switch (dragType) {
        case "resource":
          target = event.currentTarget.querySelector("select")
          dragData = {
            actorId: this.document.id,
            type: "roll",
            rollType: dragType,
            rollTarget: dataset.dragTarget,
            value: target.value,
          }
          break
        case "save":
          dragData = {
            actorId: this.document.id,
            type: "roll",
            rollType: dragType,
            rollTarget: dataset.dragTarget,
            value: dataset.value,
          }
          break
        case "damage":
          target = event.currentTarget.querySelector("select")
          dragData = {
            actorId: this.document.id,
            type: "roll",
            rollType: dragType,
            rollTarget: dataset.dragTarget,
            value: target.value,
          }
          break
      }
    }

    if (!dragData) return

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData))
  }

  /** @override */
  async getData(options) {
    const context = super.getData(options)

    // By using isEditable, it will allow the automatic configuration to disabled on all input, select and textarea
    context.editable = this.actor.isUnlocked
    context.uneditable = !this.actor.isUnlocked    // For all items, we enrich the description
    context.abilities = []
    const abilitiesRaw = this.actor.itemTypes.ability
    for (const item of abilitiesRaw) {
      item.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description, { async: true })
      context.abilities.push(item)
    }    context.magics = []
    const magicsRaw = this.actor.itemTypes.magic
    for (const item of magicsRaw) {
      item.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description, { async: true })
      context.magics.push(item)
    }    context.weapons = []
    const weaponsRaw = this.actor.itemTypes.weapon
    for (const item of weaponsRaw) {
      item.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description, { async: true })
      context.weapons.push(item)
    }    context.otheritems = []
    const otheritemsRaw = this.actor.itemTypes.item
    for (const item of otheritemsRaw) {
      item.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description, { async: true })
      context.otheritems.push(item)
    }    context.conditions = []
    const conditionsRaw = this.actor.itemTypes.definition
    for (const item of conditionsRaw) {
      item.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description, { async: true })
      context.conditions.push(item)
    }    context.enrichedBiography = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.biography, { async: true })
    context.enrichedNotes = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.notes, { async: true })
    context.enrichedEquipment = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.equipment, { async: true })

    context.isGm = game.user.isGM
    context.hasImage = this.actor.hasImage

    context.system = this.actor.system

    context.diceValues = SYSTEM.DICE_VALUES
    context.diceMaxValues = SYSTEM.DICE_MAX_VALUES
    context.diceDamageValues = SYSTEM.DICE_DAMAGE_VALUES

    const healthDisplay = game.settings.get("cthack", "HealthDisplay")
    context.displayHD = true
    context.displayHP = true
    if (healthDisplay === "hp") {
      context.displayHD = false
    } else if (healthDisplay === "hd") {
      context.displayHP = false
    }

    context.isWealthAsResource = game.settings.get("cthack", "Wealth") === "resource"
    context.hasLostFlashlights = this.actor.system.attributes.flashlights.value !== this.actor.system.attributes.flashlights.max
    context.hasLostSmokes = this.actor.system.attributes.smokes.value !== this.actor.system.attributes.smokes.max
    context.hasLostSanity = this.actor.system.attributes.sanity.value !== this.actor.system.attributes.sanity.max
    context.hasLostMiscellaneous = this.actor.system.attributes.miscellaneous.value !== this.actor.system.attributes.miscellaneous.max
    context.hasLostHitDice = this.actor.system.attributes.hitDice.value !== this.actor.system.attributes.hitDice.max
    context.hasLostWealthDice = this.actor.system.attributes.wealthDice.value !== this.actor.system.attributes.wealthDice.max

    console.debug("Character Sheet Context", context)
    return context
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html)

    html.find(".sheet-lock").click(this._onSheetLock.bind(this))

    // Add Item
    html.find(".item-create").click(this._onItemCreate.bind(this))

    // Image actions
    html.find(".share-image").click(this._onShareImage.bind(this))
    html.find(".editable-image").on("contextmenu", this._resetImage.bind(this))

    // Saving roll
    html.find(".save-name").click(this._onSaveRoll.bind(this))

    // Resource roll
    html.find(".resource-name").click(this._onResourceRoll.bind(this))

    // Armed and unarmed damage rolls
    html.find(".damage.rollable").click(this._onDamagedRoll.bind(this))

    // Roll for item in inventory
    html.find(".fa-dice-d20").click(this._onMaterialRoll.bind(this))

    // Wealth roll if the option is enabled
    if (game.settings.get("cthack", "Wealth") == "resource") {
      html.find(".wealth-name").click(this._onResourceRoll.bind(this))
    }

    // HitDice roll if the option is enabled
    if (game.settings.get("cthack", "HitDiceResource")) {
      html.find(".hit-name").click(this._onResourceRoll.bind(this))
    }

    // Miscellaneous roll if the option is enabled
    if (game.settings.get("cthack", "MiscellaneousResource")) {
      html.find(".miscellaneous-name").click(this._onResourceRoll.bind(this))
    }

    // Adrenaline option
    html.find("#adr1").click(this._onAdrenalineUse.bind(this))
    html.find("#adr2").click(this._onAdrenalineUse.bind(this))

    // Activate context menu
    this._contextCharacterMenu(html)

    html.find(".search-name").on("contextmenu", this._onSearchActor.bind(this))
  }

  //#endregion

  //#region Private methods

  /**
   * Create the context menu for the character sheet.
   * @param {*} html
   */
  _contextCharacterMenu(html) {
    foundry.applications.ux.ContextMenu.implementation.create(this, html[0], ".character-contextmenu", this._getCharacterEntryContextOptions(), { jQuery: false})
    foundry.applications.ux.ContextMenu.implementation.create(this, html[0], ".character-sidebar-contextmenu", this._getCharacterSidebarEntryContextOptions(), { jQuery: false})
  }

  /**
   * Add the context menu options for the character sheet.
   * @returns
   */
  _getCharacterEntryContextOptions() {
    return [
      {
        name: game.i18n.localize("CTHACK.ContextMenuSendToChatAll"),
        icon: '<i class="fa-solid fa-users"></i>',
        condition: (li) => {
          const item = this.actor.items.get(li.dataset.itemId)
          return item.isOwner && item.system.hasDescription
        },        callback: async (li) => {
          const item = this.actor.items.get(li.dataset.itemId)
          ChatMessage.create({
            user: game.user.id,
            content: await foundry.applications.handlebars.renderTemplate(`systems/cthack/templates/chat/item-description.hbs`, {
              item: item,
            }),
          })
        },
      },
      {
        name: game.i18n.localize("CTHACK.ContextMenuSendToChatGM"),
        icon: '<i class="fa-solid fa-user"></i>',
        condition: (li) => {
          const item = this.actor.items.get(li.dataset.itemId)
          return item.isOwner && item.system.hasDescription && !game.user.isGM
        },        callback: async (li) => {
          const item = this.actor.items.get(li.dataset.itemId)
          ChatMessage.create({
            user: game.user.id,
            whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
            content: await foundry.applications.handlebars.renderTemplate(`systems/cthack/templates/chat/item-description.hbs`, {
              item: item,
            }),
          })
        },
      },
      {
        name: game.i18n.localize("CTHACK.ContextMenuUse"),
        icon: '<i class="fas fa-check"></i>',
        condition: (li) => {
          const item = this.actor.items.get(li.dataset.itemId)
          return item.isOwner && item.type === "ability" && item.system.isUsable
        },
        callback: (li) => {
          const item = this.actor.items.get(li.dataset.itemId)
          item.system.use()
          this.render()
        },
      },
      {
        name: game.i18n.localize("CTHACK.ContextMenuResetUse"),
        icon: '<i class="fa-solid fa-0"></i>',
        condition: (li) => {
          const item = this.actor.items.get(li.dataset.itemId)
          return item.isOwner && item.type === "ability" && item.system.isResetable
        },
        callback: (li) => {
          const item = this.actor.items.get(li.dataset.itemId)
          item.system.resetUse()
          this.render()
        },
      },
      {
        name: game.i18n.localize("CTHACK.ContextMenuIncreaseUse"),
        icon: '<i class="fa-solid fa-plus"></i>',
        condition: (li) => {
          const item = this.actor.items.get(li.dataset.itemId)
          return item.isOwner && item.type === "ability" && item.system.isIncreaseable
        },
        callback: (li) => {
          const item = this.actor.items.get(li.dataset.itemId)
          item.system.increase()
          this.render()
        },
      },
      {
        name: game.i18n.localize("CTHACK.ContextMenuEdit"),
        icon: '<i class="fas fa-edit"></i>',
        condition: (li) => {
          const item = this.actor.items.get(li.dataset.itemId)
          return item.isOwner
        },
        callback: (li) => {
          const item = this.actor.items.get(li.dataset.itemId)
          item.sheet.render(true)
        },
      },
      {
        name: game.i18n.localize("CTHACK.ContextMenuDelete"),
        icon: '<i class="fas fa-trash"></i>',
        condition: (li) => {
          const item = this.actor.items.get(li.dataset.itemId)
          return item.isOwner
        },
        callback: async (li) => {
          const item = this.actor.items.get(li.dataset.itemId)
          const key = item.system.key
          switch (item.type) {
            case "ability":
              await this.actor.deleteAbility(key, item.id)
              await this.actor.deleteEmbeddedDocuments("Item", [item.id])
              break
            case "definition":
              await this.actor.deleteEffectFromItem(item)
              await this.actor.deleteEmbeddedDocuments("Item", [item.id])
              break
            default:
              await this.actor.deleteEmbeddedDocuments("Item", [item.id])
              break
          }
        },
      },
    ]
  }

  /**
   * Add the context menu options for the character sheet.
   * @returns
   */
  _getCharacterSidebarEntryContextOptions() {
    return [
      {
        name: game.i18n.localize("CTHACK.ContextMenuUse"),
        icon: '<i class="fas fa-check"></i>',
        condition: (li) => {
          const currentValue = game.settings.get("cthack", "FortuneValue")
          return currentValue > 0 && game.user.isGM
        },
        callback: (li) => {
          const currentValue = game.settings.get("cthack", "FortuneValue")
          const newValue = currentValue - 1

          game.settings.set("cthack", "FortuneValue", newValue)
          ChatMessage.create({
            user: game.user.id,
            content: game.i18n.format("CTHACK.FortuneUseMessage", { name: this.actor.name, total: newValue }),
          })
        },
      },
      {
        name: game.i18n.localize("CTHACK.ContextMenuIncreaseUse"),
        icon: '<i class="fa-solid fa-plus"></i>',
        condition: (li) => {
          return game.user.isGM
        },
        callback: (li) => {
          const currentValue = game.settings.get("cthack", "FortuneValue")
          const newValue = currentValue + 1
          game.settings.set("cthack", "FortuneValue", newValue)
        },
      },
    ]
  }

  /**
   * Handles the event when sharing an image.
   *
   * @param {Event} event - The event object.
   * @returns {void}
   */
  _onShareImage(event) {
    event.preventDefault()
    const imagePath = event.currentTarget.dataset.image
    const characterName = event.currentTarget.dataset.name

    const ip = new ImagePopout(imagePath, { title: characterName })

    // Display the image popout
    ip.render(true)
  }

  /**
   * Resets the image of the character sheet.
   * @param {Event} event - The event object.
   * @returns {Promise<void>} - A promise that resolves when the image is reset.
   */
  async _resetImage(event) {
    event.preventDefault()
    await this.actor.update({ img: "icons/svg/mystery-man.svg" })
  }

  /**
   * Handles the search event for an actor.
   * @param {Event} event - The search event.
   * @returns {Promise<void>} - A promise that resolves when the search is complete.
   */
  async _onSearchActor(event) {
    event.preventDefault()
    const characterName = event.currentTarget.dataset.name
    let search = await new SearchChat().create(characterName)
    await search.searchWorld()
    await search.display()
  }

  /** @override */
  async _onDropItemCreate(itemData) {
    // Only if the sheet is unlocked
    if (!this.actor.isUnlocked) return

    switch (itemData.type) {
      case "archetype":
        return await this._onDropArchetypeItem(itemData)
      case "ability":
        return await this._onDropAbilityItem(itemData)
      case "definition":
        return await this._onDropDefinitionItem(itemData)
      case "item":
      case "weapon":
      case "magic":
        return await this._onDropStandardItem(itemData)
      default:
        return
    }
  }

  /**
   * @name _onDropStandardItem
   * @description Handles dropping of an item reference or item data onto an Actor Sheet
   * 				Handles weapon and item types for character, and attack for opponent
   * @private
   *
   * @param {Object} data   The data transfer extracted from the event
   * Item of type 'attack' for npc, 'item', 'weapon', 'magic' for pc
   * @return {Object} EmbeddedDocument Item data to create
   */
  async _onDropStandardItem(data) {
    if (!this.actor.isOwner) return false

    // Create the owned item
    return await this.actor.createEmbeddedDocuments("Item", [data], { renderSheet: false })
  }

  /**
   * Handle dropping of an item reference or item data of type definition onto an Actor Sheet
   * @param {Object} data         The data transfer extracted from the event
   * @return {Object}             EmbeddedDocument Item to create
   * @private
   */
  async _onDropDefinitionItem(data) {
    if (!this.actor.isOwner) return false

    const itemData = foundry.utils.deepClone(data)
    itemData.system.creationDate = formatDate(new Date())

    return this.actor.createDefinitionItem(itemData)
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
    })
    this.actor.sheet.render(true)
  }

  /**
   * Handle dropping of an ability Item onto an Actor Sheet
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @private
   */
  async _onDropAbilityItem(itemData) {
    const id = itemData._id
    const key = itemData.system.key
    const multiple = itemData.system.multiple

    let abilitiesList = this.actor.system.abilities

    if (multiple) {
      if (!this._hasAbility(key, abilitiesList)) {
        abilitiesList.push({ key: key, id: id })
        await this.actor.update({ "system.abilities": abilitiesList })
      }
      return await this.actor.createEmbeddedDocuments("Item", [itemData], { renderSheet: false })
    } else {
      if (!this._hasAbility(key, abilitiesList)) {
        abilitiesList.push({ key: key, id: id })
        await this.actor.update({ "system.abilities": abilitiesList })
        return await this.actor.createEmbeddedDocuments("Item", [itemData], { renderSheet: false })
      } else {
        ui.notifications.warn(game.i18n.format("CTHACK.Notifications.AbilityHasAlready", { abilityName: itemData.name }))
        return
      }
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
        return true
      }
    }
    return false
  }

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
    event.preventDefault()
    event.stopPropagation()
    const li = event.currentTarget
    // Get the type of item to create.
    let type
    event?.shiftKey ? (type = li.dataset.altType) : (type = li.dataset.type)

    // Initialize a default name.
    const name = game.i18n.format("CTHACK.ItemNew", { type: game.i18n.localize(`CTHACK.ItemType${type.capitalize()}`) })
    // Prepare the item object
    const itemData = {
      name: name,
      type: type,
    }

    // Create the item
    return await this.actor.createEmbeddedDocuments("Item", [itemData], { renderSheet: true })
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
    event.preventDefault()
    let save = event.currentTarget.parentElement.dataset.save
    this.actor.rollSave(save, { event: event })
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
    event.preventDefault()
    let resource = event.currentTarget.dataset.resource

    await this.actor.rollResource(resource, { event: event })
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
    event.preventDefault()

    const li = $(event.currentTarget).parents(".item")
    const itemId = li.dataset.itemId
    let item = this.actor.items.get(itemId)

    await this.actor.rollMaterial(item, { event: event })
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
    event.preventDefault()
    const damage = event.currentTarget.dataset.resource
    this.actor.rollDamage(damage, { event: event })
  }

  /**
   * Toggle adrenaline 1
   * @param {Event} event   The originating click event
   * @private
   */
  _onAdrenalineUse(event) {
    event.preventDefault()
    const adr = event.currentTarget.id
    if (adr === "adr1") {
      const value = this.actor.system.attributes.adrenaline1.value
      const newValue = value === "pj" ? "mj" : "pj"
      this.actor.update({ "system.attributes.adrenaline1.value": newValue })
    } else if (adr === "adr2") {
      const value = this.actor.system.attributes.adrenaline2.value
      const newValue = value === "pj" ? "mj" : "pj"
      this.actor.update({ "system.attributes.adrenaline2.value": newValue })
    }
  }

  /**
   * Lock or unlock the sheet
   * @param {*} event
   */
  async _onSheetLock(event) {
    event.preventDefault()
    let flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked")
    if (flagData) await this.actor.unsetFlag(game.system.id, "SheetUnlocked")
    else await this.actor.setFlag(game.system.id, "SheetUnlocked", "SheetUnlocked")
    this.actor.sheet.render(true)
  }

  //#endregion
}
