import { SYSTEM } from "../../config/system.mjs"
import { SearchChat } from "../research.mjs"

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export default class CtHackOpponentSheet extends foundry.appv1.sheets.ActorSheet {
  // Variable to check if the appV1 is used : will remove warning
  // To migrate before V16
  static _warnedAppV1 = true

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cthack", "sheet", "actor", "opponent"],
      width: 600,
      height: 500,
    })
  }

  /* -------------------------------------------- */

  /** @override */
  get template() {
    return "systems/cthack/templates/sheets/opponent.hbs"
  }

  /** @override */
  async getData(options) {
    const context = super.getData(options)

    // By using isEditable, it will allow the automatic configuration to disabled on all input, select and textarea
    context.editable = this.actor.isUnlocked

    context.attacks = this.actor.itemTypes.attack
    context.attacks = []
    const attacksRaw = this.actor.itemTypes.attack
    for (const attack of attacksRaw) {
      attack.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(attack.system.description, { async: true })
      context.attacks.push(attack)
    }
    context.magics = []
    const magicsRaw = this.actor.itemTypes.magic
    for (const magic of magicsRaw) {
      magic.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(magic.system.description, { async: true })
      context.magics.push(magic)
    }
    context.opponentAbilities = []
    const opponentAbilitiesRaw = this.actor.itemTypes.opponentAbility
    for (const ability of opponentAbilitiesRaw) {
      ability.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(ability.system.description, { async: true })
      context.opponentAbilities.push(ability)
    }

    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.description, { async: true })
    context.hasImage = this.actor.hasImage
    context.hasShortDescription = !!this.actor.system.description
    context.opponentHitDice = SYSTEM.OPPONENT_HIT_DICE

    context.system = this.actor.system
    return context
  }

  /** @override */
  async _onDropItem(event, data) {
    if (!this.isEditable) return false
    const item = await fromUuid(data.uuid)
    // Only magic, attack and opponent-ability items can be dropped
    if (["archetype", "ability", "item", "weapon", "definition"].includes(item.type)) return false
    else return super._onDropItem(event, data)
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html)

    html.find(".sheet-lock").click(this._onSheetLock.bind(this))

    html.find(".attack-create").click(this._onAttackCreate.bind(this))

    html.find(".selectHitDice").change(this._onChangeHitDice.bind(this))

    // Roll for attack
    html.find(".fa-dice-d20.attack").click(this._onAttackDamageRoll.bind(this))

    // Roll for sanity
    html.find(".fa-dice-d20.sanity").click(this._onSanityRoll.bind(this))

    // Activate context menu
    this._contextOpponentMenu(html)

    html.find(".share-image").click(this._onShareImage.bind(this))
    html.find(".editable-image").on("contextmenu", this._resetImage.bind(this))
    html.find(".search-name").on("contextmenu", this._onSearchActor.bind(this))
  }

  _contextOpponentMenu(html) {
    foundry.applications.ux.ContextMenu.implementation.create(this, html[0], ".opponent-contextmenu", this._getEntryContextOptions(), { jQuery: false })
  }

  _getEntryContextOptions() {
    return [
      {
        name: game.i18n.localize("CTHACK.ContextMenuUse"),
        icon: '<i class="fas fa-check"></i>',
        condition: (li) => {
          const item = this.actor.items.get(li.dataset.itemId)
          return item.isOwner && item.type === "opponentAbility" && item.system.isUsable
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
          return item.isOwner && item.type === "opponentAbility" && item.system.isResetable
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
          return item.isOwner && item.type === "opponentAbility" && item.system.isIncreaseable
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
          await this.actor.deleteEmbeddedDocuments("Item", [item.id])
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

  /**
   * Resets the image of the opponent sheet.
   * @param {Event} event - The event object.
   * @returns {Promise<void>} - A promise that resolves when the image is reset.
   */
  async _resetImage(event) {
    event.preventDefault()
    await this.actor.update({ img: "icons/svg/mystery-man.svg" })
  }

  /**
   * Searches for a pattern in the game journal and displays the search result in the chat.
   * @param {string} searchPattern - The pattern to search for.
   * @returns {Promise<void>} - A promise that resolves when the search result is displayed in the chat.
   */
  async patternSearch(searchPattern) {
    let resultCollection = []
    game.journal.forEach((doc) => {
      resultCollection.push(...doc.pages.search({ query: searchPattern }))
    })
    const htmlChat = await foundry.applications.handlebars.renderTemplate("systems/cthack/templates/chat/search-result.hbs", {
      resultCollection: resultCollection,
      pattern: searchPattern,
    })
    const chatData = {
      content: htmlChat,
      whisper: [game.user],
    }
    ChatMessage.create(chatData)
    return
  }

  /**
   * Handles the change on the HitDice value
   * @param {*} event The originating change event
   */
  async _onChangeHitDice(event) {
    const newHitDiceValue = parseInt(event.currentTarget.value)
    const newHpMax = 4 * newHitDiceValue
    const newArmorMalusValue = -1 * (newHitDiceValue - 1)
    await this.actor.update({
      "system.hitDice": newHitDiceValue,
      "system.hp.value": newHpMax,
      "system.hp.max": newHpMax,
      "system.malus": newArmorMalusValue,
    })
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onAttackCreate(event) {
    event.preventDefault()
    const header = event.currentTarget
    // Get the type of item to create.
    const type = header.dataset.type
    // Initialize a default name.
    const name = game.i18n.format("CTHACK.ItemNew", { type: game.i18n.localize(`CTHACK.ItemType${type.capitalize()}`) })
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
    }
    // Finally, create the item
    return await this.actor.createEmbeddedDocuments("Item", [itemData], { renderSheet: true })
  }

  /**
   * Handle clickable Damaged roll.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onAttackDamageRoll(event) {
    // Stop propagation to avoid expanding the item
    event.preventDefault()
    event.stopPropagation()

    const li = event.currentTarget.closest(".item")
    const itemId = li.dataset.itemId
    const item = this.actor.items.get(itemId)

    await this.actor.system.rollAttack(item.system.damageDice, item.name)
  }

  /**
   * Handles the event when a magic roll is triggered.
   * @param {Event} event - The event object.
   * @returns {Promise<void>} - A promise that resolves when the function finishes executing.
   */
  async _onSanityRoll(event) {
    // Stop propagation to avoid expanding the item
    event.preventDefault()
    event.stopPropagation()

    const li = event.currentTarget.closest(".item")
    const itemId = li.dataset.itemId
    const item = this.actor.items.get(itemId)

    await this.actor.rollSanity(item, { event: event })

    // Render to refresh in case of resource lost
    this.actor.sheet.render(true)
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
}
