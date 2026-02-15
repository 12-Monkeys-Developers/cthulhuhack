import CtHackActorSheet from "./actor.mjs"

const { ux } = foundry.applications

export default class CtHackOpponentSheet extends CtHackActorSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["opponent"],
    window: {
      contentClasses: ["opponent-content"],
    },
    position: {
      width: 600,
      height: 500,
    },
    actions: {
      createItem: CtHackOpponentSheet.#onCreateItem,
      rollAttack: CtHackOpponentSheet.#onAttackDamageRoll,
      rollSanity: CtHackOpponentSheet.#onSanityRoll,
    },
    dragDrop: [{ dragSelector: ".items-list .item", dropSelector: null }],
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/cthack/templates/sheets/opponent.hbs",
    },
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options)

    context.attacks = []
    const attacksRaw = this.document.itemTypes.attack
    for (const attack of attacksRaw) {
      attack.enrichedDescription = await ux.TextEditor.implementation.enrichHTML(attack.system.description, { async: true })
      context.attacks.push(attack)
    }

    context.magics = []
    const magicsRaw = this.document.itemTypes.magic
    for (const magic of magicsRaw) {
      magic.enrichedDescription = await ux.TextEditor.implementation.enrichHTML(magic.system.description, { async: true })
      context.magics.push(magic)
    }

    context.opponentAbilities = []
    const opponentAbilitiesRaw = this.document.itemTypes.opponentAbility
    for (const ability of opponentAbilitiesRaw) {
      ability.enrichedDescription = await ux.TextEditor.implementation.enrichHTML(ability.system.description, { async: true })
      context.opponentAbilities.push(ability)
    }

    context.enrichedDescription = await ux.TextEditor.implementation.enrichHTML(this.document.system.description, { async: true })
    context.hasShortDescription = !!this.document.system.description
    context.opponentHitDice = SYSTEM.OPPONENT_HIT_DICE

    return context
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options)

    // Context menu for opponent items
    new foundry.applications.ux.ContextMenu.implementation(
      this.element, ".opponent-contextmenu",
      this._getEntryContextOptions(), { jQuery: false }
    )
  }

  /** @override */
  async _onDropItem(event, data) {
    if (!this.isEditMode) return false
    const item = await fromUuid(data.uuid)
    // Only magic, attack and opponent-ability items can be dropped
    if (["archetype", "ability", "item", "weapon", "definition"].includes(item.type)) return false
    return super._onDropItem(event, data)
  }

  /**
   * Intercept form submission to compute derived values when hitDice changes.
   * @override
   */
  async _prepareSubmitData(event, form, formData) {
    const submitData = await super._prepareSubmitData(event, form, formData)
    // When hitDice changes, compute HP max and malus
    if ("system.hitDice" in submitData) {
      const newHitDice = parseInt(submitData["system.hitDice"])
      if (newHitDice !== this.document.system.hitDice) {
        submitData["system.hp.value"] = 4 * newHitDice
        submitData["system.hp.max"] = 4 * newHitDice
        submitData["system.malus"] = -1 * (newHitDice - 1)
      }
    }
    return submitData
  }

  /**
   * Context menu options for opponent items.
   * @returns {Array}
   */
  _getEntryContextOptions() {
    return [
      {
        name: game.i18n.localize("CTHACK.ContextMenuUse"),
        icon: '<i class="fas fa-check"></i>',
        condition: (li) => {
          const item = this.document.items.get(li.dataset.itemId)
          return item.isOwner && item.type === "opponentAbility" && item.system.isUsable
        },
        callback: (li) => {
          const item = this.document.items.get(li.dataset.itemId)
          item.system.use()
          this.render()
        },
      },
      {
        name: game.i18n.localize("CTHACK.ContextMenuResetUse"),
        icon: '<i class="fa-solid fa-0"></i>',
        condition: (li) => {
          const item = this.document.items.get(li.dataset.itemId)
          return item.isOwner && item.type === "opponentAbility" && item.system.isResetable
        },
        callback: (li) => {
          const item = this.document.items.get(li.dataset.itemId)
          item.system.resetUse()
          this.render()
        },
      },
      {
        name: game.i18n.localize("CTHACK.ContextMenuIncreaseUse"),
        icon: '<i class="fa-solid fa-plus"></i>',
        condition: (li) => {
          const item = this.document.items.get(li.dataset.itemId)
          return item.isOwner && item.type === "opponentAbility" && item.system.isIncreaseable
        },
        callback: (li) => {
          const item = this.document.items.get(li.dataset.itemId)
          item.system.increase()
          this.render()
        },
      },
      {
        name: game.i18n.localize("CTHACK.ContextMenuEdit"),
        icon: '<i class="fas fa-edit"></i>',
        condition: (li) => {
          const item = this.document.items.get(li.dataset.itemId)
          return item.isOwner
        },
        callback: (li) => {
          const item = this.document.items.get(li.dataset.itemId)
          item.sheet.render(true)
        },
      },
      {
        name: game.i18n.localize("CTHACK.ContextMenuDelete"),
        icon: '<i class="fas fa-trash"></i>',
        condition: (li) => {
          const item = this.document.items.get(li.dataset.itemId)
          return item.isOwner
        },
        callback: async (li) => {
          const item = this.document.items.get(li.dataset.itemId)
          await this.document.deleteEmbeddedDocuments("Item", [item.id])
        },
      },
    ]
  }

  /**
   * Handle creating a new item for the opponent.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onCreateItem(event, target) {
    const type = target.dataset.type
    const name = game.i18n.format("CTHACK.ItemNew", { type: game.i18n.localize(`CTHACK.ItemType${type.capitalize()}`) })
    const itemData = { name, type }
    return await this.document.createEmbeddedDocuments("Item", [itemData], { renderSheet: true })
  }

  /**
   * Handle rolling attack damage.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onAttackDamageRoll(event, target) {
    event.stopPropagation()
    const li = target.closest(".item")
    const itemId = li.dataset.itemId
    const item = this.document.items.get(itemId)
    await this.document.system.rollAttack(item.system.damageDice, item.name)
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
}
