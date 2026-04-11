import CtHackActorSheet from "./actor.mjs"
import { formatDate } from "../../utils.mjs"

const { ux } = foundry.applications

export default class CtHackCharacterSheet extends CtHackActorSheet {

  constructor(options) {
    super(options)
    Hooks.on("updateSetting", async (document, change, options, userId) => {
      if (document.key === "cthack.FortuneValue") {
        this.render()
      }
    })
  }

  /** Width of the sheet in play mode. */
  static PLAY_WIDTH = 1100

  /** Width of the sheet in edit mode. */
  static EDIT_WIDTH = 1300

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["character"],
    window: {
      contentClasses: ["character-content"],
    },
    position: {
      width: 1100,
      height: 860,
    },
    actions: {
      createItem: CtHackCharacterSheet.#onCreateItem,
      rollSave: CtHackCharacterSheet.#onSaveRoll,
      rollResource: CtHackCharacterSheet.#onResourceRoll,
      rollDamage: CtHackCharacterSheet.#onDamageRoll,
      rollMaterial: CtHackCharacterSheet.#onMaterialRoll,
      rollSanity: CtHackCharacterSheet.#onSanityRoll,
      toggleAdrenaline: CtHackCharacterSheet.#onToggleAdrenaline,
    },
    dragDrop: [{ dragSelector: '.items-list .item, [data-drag="true"]', dropSelector: null }],
  }

  /** @override */
  static PARTS = {
    sidebar: {
      template: "systems/cthack/templates/sheets/parts/character-sidebar.hbs",
    },
    header: {
      template: "systems/cthack/templates/sheets/parts/character-header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    description: {
      template: "systems/cthack/templates/sheets/parts/character-description.hbs",
    },
    equipment: {
      template: "systems/cthack/templates/sheets/parts/character-equipment.hbs",
    },
    abilities: {
      template: "systems/cthack/templates/sheets/parts/character-abilities.hbs",
    },
    notes: {
      template: "systems/cthack/templates/sheets/parts/character-notes.hbs",
    },
  }

  /** @override */
  static TABS = {
    primary: {
      tabs: [
        { id: "description", icon: "", label: "CTHACK.Description" },
        { id: "equipment", icon: "", label: "CTHACK.Items" },
        { id: "abilities", icon: "", label: "CTHACK.AbilitiesAndMagic" },
        { id: "notes", icon: "", label: "CTHACK.Notes" },
      ],
      initial: "equipment",
    },
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options)

    // Enrich item descriptions
    context.abilities = []
    for (const item of this.document.itemTypes.ability) {
      item.enrichedDescription = await ux.TextEditor.implementation.enrichHTML(item.system.description, { async: true })
      context.abilities.push(item)
    }

    context.magics = []
    for (const item of this.document.itemTypes.magic) {
      item.enrichedDescription = await ux.TextEditor.implementation.enrichHTML(item.system.description, { async: true })
      context.magics.push(item)
    }

    context.weapons = []
    for (const item of this.document.itemTypes.weapon) {
      item.enrichedDescription = await ux.TextEditor.implementation.enrichHTML(item.system.description, { async: true })
      context.weapons.push(item)
    }
    context.nbWeapons = context.weapons.length

    context.otheritems = []
    for (const item of this.document.itemTypes.item) {
      item.enrichedDescription = await ux.TextEditor.implementation.enrichHTML(item.system.description, { async: true })
      context.otheritems.push(item)
    }
    context.nbOtherItems = context.otheritems.length

    context.conditions = []
    for (const item of this.document.itemTypes.definition) {
      item.enrichedDescription = await ux.TextEditor.implementation.enrichHTML(item.system.description, { async: true })
      context.conditions.push(item)
    }

    // Enrich text fields
    context.enrichedBiography = await ux.TextEditor.implementation.enrichHTML(this.document.system.biography, { async: true })
    context.enrichedNotes = await ux.TextEditor.implementation.enrichHTML(this.document.system.notes, { async: true })
    context.enrichedEquipment = await ux.TextEditor.implementation.enrichHTML(this.document.system.equipment, { async: true })

    // Health display settings
    const healthDisplay = game.settings.get("cthack", "HealthDisplay")
    context.displayHD = true
    context.displayHP = true
    if (healthDisplay === "hp") {
      context.displayHD = false
    } else if (healthDisplay === "hd") {
      context.displayHP = false
    }

    // Resource flags
    context.isWealthAsResource = game.settings.get("cthack", "Wealth") === "resource"
    context.hasLostFlashlights = this.document.system.attributes.flashlights.value !== this.document.system.attributes.flashlights.max
    context.hasLostSmokes = this.document.system.attributes.smokes.value !== this.document.system.attributes.smokes.max
    context.hasLostSanity = this.document.system.attributes.sanity.value !== this.document.system.attributes.sanity.max
    context.hasLostMiscellaneous = this.document.system.attributes.miscellaneous.value !== this.document.system.attributes.miscellaneous.max
    context.hasLostHitDice = this.document.system.attributes.hitDice.value !== this.document.system.attributes.hitDice.max
    context.hasLostWealthDice = this.document.system.attributes.wealthDice.value !== this.document.system.attributes.wealthDice.max

    // Encumbrance
    context.isEncumbranceEnabled = game.settings.get("cthack", "useSize")
    if (context.isEncumbranceEnabled) {
      context.encumbrance = this.document.system.encumbrance.value
    }

    // Pre-computed saves context for formInput (Handlebars can't do dynamic schema lookups)
    const savesSchema = this.document.system.schema.fields.saves.fields
    context.savesContext = Object.entries(this.document.system.saves).map(([key, save]) => ({
      key,
      value: save.value,
      advantage: save.advantage,
      valueField: savesSchema[key].fields.value,
      advantageField: savesSchema[key].fields.advantage,
      valueName: `system.saves.${key}.value`,
      advantageName: `system.saves.${key}.advantage`,
    }))

    return context
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options)

    // Context menus
    new foundry.applications.ux.ContextMenu.implementation(
      this.element, ".character-contextmenu",
      this._getCharacterEntryContextOptions(), { jQuery: false }
    )
    new foundry.applications.ux.ContextMenu.implementation(
      this.element, ".character-sidebar-contextmenu",
      this._getCharacterSidebarEntryContextOptions(), { jQuery: false }
    )
  }

  /** @override */
  async _onSheetChangeLock(event) {
    const modes = this.constructor.SHEET_MODES
    const isCurrentlyEdit = this._sheetMode === modes.EDIT
    await super._onSheetChangeLock(event)
    // Resize width based on new mode
    const newWidth = isCurrentlyEdit ? this.constructor.PLAY_WIDTH : this.constructor.EDIT_WIDTH
    this.setPosition({ width: newWidth })
  }

  /** @override */
  _onDragStart(event) {
    if ("link" in event.target.dataset) return

    const li = event.currentTarget

    let dragData

    // Owned Items
    if (li.dataset.itemId) {
      const item = this.document.items.get(li.dataset.itemId)
      dragData = item.toDragData()
    }

    // Active Effect
    if (li.dataset.effectId) {
      const effect = this.document.effects.get(li.dataset.effectId)
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
            value: dataset.dragValue,
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

    event.dataTransfer.setData("text/plain", JSON.stringify(dragData))
  }

  /** @override */
  async _onDropItem(event, data) {
    if (!this.isEditMode) return false
    const item = await fromUuid(data.uuid)

    switch (item.type) {
      case "archetype":
        return await this._onDropArchetypeItem(item.toObject())
      case "ability":
        return await this._onDropAbilityItem(item.toObject())
      case "definition":
        return await this._onDropDefinitionItem(item.toObject())
      case "item":
      case "weapon":
      case "magic":
        return await this._onDropStandardItem(item.toObject())
      default:
        return
    }
  }

  // #region Drop handlers

  async _onDropStandardItem(data) {
    if (!this.document.isOwner) return false
    return await this.document.createEmbeddedDocuments("Item", [data], { renderSheet: false })
  }

  async _onDropDefinitionItem(data) {
    if (!this.document.isOwner) return false
    const itemData = foundry.utils.deepClone(data)
    itemData.system.creationDate = formatDate(new Date())
    return this.document.createDefinitionItem(itemData)
  }

  _onDropArchetypeItem(itemData) {
    this.document.update({
      "system.archetype": itemData.name,
      "system.attributes.flashlights": { value: itemData.system.flashlights, max: itemData.system.flashlights },
      "system.attributes.smokes": { value: itemData.system.smokes, max: itemData.system.smokes },
      "system.attributes.sanity": { value: itemData.system.sanity, max: itemData.system.sanity },
      "system.attributes.hitDice": { value: itemData.system.hitdice },
      "system.attributes.wealthDice": { value: itemData.system.wealthDice },
      "system.attributes.armedDamage": { value: itemData.system.armeddamage },
      "system.attributes.unarmedDamage": { value: itemData.system.unarmeddamage },
    })
    this.render()
  }

  async _onDropAbilityItem(itemData) {
    const id = itemData._id
    const key = itemData.system.key
    const multiple = itemData.system.multiple

    let abilitiesList = this.document.system.abilities

    if (multiple) {
      if (!this._hasAbility(key, abilitiesList)) {
        abilitiesList.push({ key: key, id: id })
        await this.document.update({ "system.abilities": abilitiesList })
      }
      return await this.document.createEmbeddedDocuments("Item", [itemData], { renderSheet: false })
    } else {
      if (!this._hasAbility(key, abilitiesList)) {
        abilitiesList.push({ key: key, id: id })
        await this.document.update({ "system.abilities": abilitiesList })
        return await this.document.createEmbeddedDocuments("Item", [itemData], { renderSheet: false })
      } else {
        ui.notifications.warn(game.i18n.format("CTHACK.Notifications.AbilityHasAlready", { abilityName: itemData.name }))
        return
      }
    }
  }

  _hasAbility(key, abilitiesList) {
    for (let ability of abilitiesList) {
      if (key === ability.key) {
        return true
      }
    }
    return false
  }

  // #endregion

  // #region Context menus

  _getCharacterEntryContextOptions() {
    return [
      {
        label: game.i18n.localize("CTHACK.ContextMenuSendToChatAll"),
        icon: '<i class="fa-solid fa-users"></i>',
        visible: (li) => {
          const item = this.document.items.get(li.dataset.itemId)
          return item.isOwner && item.system.hasDescription
        },
        onClick: async (event, li) => {
          const item = this.document.items.get(li.dataset.itemId)
          ChatMessage.create({
            user: game.user.id,
            content: await foundry.applications.handlebars.renderTemplate(`systems/cthack/templates/chat/item-description.hbs`, {
              item: item,
            }),
          })
        },
      },
      {
        label: game.i18n.localize("CTHACK.ContextMenuSendToChatGM"),
        icon: '<i class="fa-solid fa-user"></i>',
        visible: (li) => {
          const item = this.document.items.get(li.dataset.itemId)
          return item.isOwner && item.system.hasDescription && !game.user.isGM
        },
        onClick: async (event, li) => {
          const item = this.document.items.get(li.dataset.itemId)
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
        label: game.i18n.localize("CTHACK.ContextMenuUse"),
        icon: '<i class="fas fa-check"></i>',
        visible: (li) => {
          const item = this.document.items.get(li.dataset.itemId)
          return item.isOwner && item.type === "ability" && item.system.isUsable
        },
        onClick: (event, li) => {
          const item = this.document.items.get(li.dataset.itemId)
          item.system.use()
          this.render()
        },
      },
      {
        label: game.i18n.localize("CTHACK.ContextMenuResetUse"),
        icon: '<i class="fa-solid fa-0"></i>',
        visible: (li) => {
          const item = this.document.items.get(li.dataset.itemId)
          return item.isOwner && item.type === "ability" && item.system.isResetable
        },
        onClick: (event, li) => {
          const item = this.document.items.get(li.dataset.itemId)
          item.system.resetUse()
          this.render()
        },
      },
      {
        label: game.i18n.localize("CTHACK.ContextMenuIncreaseUse"),
        icon: '<i class="fa-solid fa-plus"></i>',
        visible: (li) => {
          const item = this.document.items.get(li.dataset.itemId)
          return item.isOwner && item.type === "ability" && item.system.isIncreaseable
        },
        onClick: (event, li) => {
          const item = this.document.items.get(li.dataset.itemId)
          item.system.increase()
          this.render()
        },
      },
      {
        label: game.i18n.localize("CTHACK.ContextMenuEdit"),
        icon: '<i class="fas fa-edit"></i>',
        visible: (li) => {
          const item = this.document.items.get(li.dataset.itemId)
          return item.isOwner
        },
        onClick: (event, li) => {
          const item = this.document.items.get(li.dataset.itemId)
          item.sheet.render(true)
        },
      },
      {
        label: game.i18n.localize("CTHACK.ContextMenuDelete"),
        icon: '<i class="fas fa-trash"></i>',
        visible: (li) => {
          const item = this.document.items.get(li.dataset.itemId)
          return item.isOwner
        },
        onClick: async (event, li) => {
          const item = this.document.items.get(li.dataset.itemId)
          const key = item.system.key
          switch (item.type) {
            case "ability":
              await this.document.deleteAbility(key, item.id)
              await this.document.deleteEmbeddedDocuments("Item", [item.id])
              break
            case "definition":
              await this.document.deleteEffectFromItem(item)
              await this.document.deleteEmbeddedDocuments("Item", [item.id])
              break
            default:
              await this.document.deleteEmbeddedDocuments("Item", [item.id])
              break
          }
        },
      },
    ]
  }

  _getCharacterSidebarEntryContextOptions() {
    return [
      {
        label: game.i18n.localize("CTHACK.ContextMenuUse"),
        icon: '<i class="fas fa-check"></i>',
        visible: (li) => {
          const currentValue = game.settings.get("cthack", "FortuneValue")
          return currentValue > 0 && game.user.isGM
        },
        onClick: (event, li) => {
          const currentValue = game.settings.get("cthack", "FortuneValue")
          const newValue = currentValue - 1
          game.settings.set("cthack", "FortuneValue", newValue)
          ChatMessage.create({
            user: game.user.id,
            content: game.i18n.format("CTHACK.FortuneUseMessage", { name: this.document.name, total: newValue }),
          })
        },
      },
      {
        label: game.i18n.localize("CTHACK.ContextMenuIncreaseUse"),
        icon: '<i class="fa-solid fa-plus"></i>',
        visible: (li) => {
          return game.user.isGM
        },
        onClick: (event, li) => {
          const currentValue = game.settings.get("cthack", "FortuneValue")
          const newValue = currentValue + 1
          game.settings.set("cthack", "FortuneValue", newValue)
        },
      },
    ]
  }

  // #endregion

  // #region Action handlers

  /**
   * Handle creating a new item.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onCreateItem(event, target) {
    event.stopPropagation()
    let type
    event?.shiftKey ? (type = target.dataset.altType) : (type = target.dataset.type)
    const name = game.i18n.format("CTHACK.ItemNew", { type: game.i18n.localize(`CTHACK.ItemType${type.capitalize()}`) })
    const itemData = { name, type }
    return await this.document.createEmbeddedDocuments("Item", [itemData], { renderSheet: true })
  }

  /**
   * Handle rolling a save.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static #onSaveRoll(event, target) {
    event.stopPropagation()
    const save = target.closest("[data-save]").dataset.save
    this.document.rollSave(save, { event })
  }

  /**
   * Handle rolling a resource.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onResourceRoll(event, target) {
    event.stopPropagation()
    const resource = target.dataset.resource
    await this.document.rollResource(resource, { event })
  }

  /**
   * Handle rolling damage.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static #onDamageRoll(event, target) {
    event.stopPropagation()
    const damage = target.dataset.resource
    this.document.rollDamage(damage, { event })
  }

  /**
   * Handle rolling material.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onMaterialRoll(event, target) {
    event.stopPropagation()
    const li = target.closest(".item")
    if (!li) return
    const itemId = li.dataset.itemId
    if (!itemId) return
    const item = this.document.items.get(itemId)
    await this.document.rollMaterial(item, { event })
  }

  /**
   * Handle rolling sanity.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onSanityRoll(event, target) {
    event.stopPropagation()
    const li = target.closest(".item")
    const itemId = li.dataset.itemId
    const item = this.document.items.get(itemId)
    await this.document.rollSanity(item, { event })
    this.render()
  }

  /**
   * Handle toggling adrenaline.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static #onToggleAdrenaline(event, target) {
    event.stopPropagation()
    const adr = target.dataset.adrenaline
    if (adr === "1") {
      const value = this.document.system.attributes.adrenaline1.value
      const newValue = value === "pj" ? "mj" : "pj"
      this.document.update({ "system.attributes.adrenaline1.value": newValue })
    } else if (adr === "2") {
      const value = this.document.system.attributes.adrenaline2.value
      const newValue = value === "pj" ? "mj" : "pj"
      this.document.update({ "system.attributes.adrenaline2.value": newValue })
    }
  }

  // #endregion
}
