import { SYSTEM_NAME } from "../constants.mjs"

const { CombatTracker } = foundry.applications.sidebar.tabs

/**
 * The combat tracker of Cthulhu Hack : no initiative, the GM orders the combatants by drag and drop,
 * the Moments done are marked, and the attacks used by the opponents during the round are tracked.
 */
export default class CtHackCombatTracker extends CombatTracker {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["cthack-combat"],
    actions: {
      toggleDone: CtHackCombatTracker.#onToggleDone,
      setTurn: CtHackCombatTracker.#onSetTurn,
      useAction: CtHackCombatTracker.#onUseAction,
    },
  }

  /** @override */
  static PARTS = {
    header: {
      template: "systems/cthack/templates/combat/header.hbs",
    },
    tracker: {
      template: "systems/cthack/templates/combat/tracker.hbs",
      scrollable: [""],
    },
    footer: {
      template: "templates/sidebar/tabs/combat/footer.hbs",
    },
  }

  /** @inheritDoc */
  async _prepareTrackerContext(context, options) {
    await super._prepareTrackerContext(context, options)
    context.combat = this.viewed
  }

  /** @inheritDoc */
  async _prepareTurnContext(combat, combatant, index) {
    const turn = await super._prepareTurnContext(combat, combatant, index)
    turn.done = combatant.done
    turn.canToggleDone = combat.started && (game.user.isGM || combatant.isOwner)
    turn.canDrag = game.user.isGM
    if (turn.done) turn.css = [turn.css, "done"].filterJoin(" ")

    // The attacks of the opponents : visible to the users who can see the actor
    if (combatant.hasActions && combatant.actor?.testUserPermission(game.user, "OBSERVER")) {
      const used = combatant.actionsUsed
      turn.actions = {
        max: combatant.actionsMax,
        used,
        left: combatant.actionsLeft,
        editable: game.user.isGM,
        pips: Array.from({ length: combatant.actionsMax }, (_, i) => ({ index: i, used: i < used })),
      }
    }
    return turn
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options)
    if (!game.user.isGM) return
    new foundry.applications.ux.DragDrop.implementation({
      dragSelector: ".combatant[data-combatant-id]",
      dropSelector: ".combat-tracker",
      permissions: { dragstart: () => game.user.isGM, drop: () => game.user.isGM },
      callbacks: {
        dragstart: this.#onDragStart.bind(this),
        dragover: this.#onDragOver.bind(this),
        dragleave: this.#onDragLeave.bind(this),
        drop: this.#onDrop.bind(this),
      },
    }).bind(this.element)
  }

  /**
   * The context menu of a combatant : no initiative entries, an entry to set the number of attacks of an opponent.
   * @inheritDoc
   */
  _getEntryContextOptions() {
    const removed = ["COMBATANT.ACTIONS.Clear", "COMBATANT.ACTIONS.Reroll"]
    const options = super._getEntryContextOptions().filter((o) => !removed.includes(o.label))
    const getCombatant = (li) => this.viewed.combatants.get(li.dataset.combatantId)
    options.splice(1, 0, {
      label: "CTHACK.Combat.SetActions",
      icon: "fa-solid fa-hand-fist",
      visible: (li) => game.user.isGM && !!getCombatant(li)?.hasActions,
      onClick: (event, li) => this.#setActionsMax(getCombatant(li)),
    })
    return options
  }

  /**
   * The context menu of the combat : no initiative reset.
   * @inheritDoc
   */
  _getCombatContextOptions() {
    return super._getCombatContextOptions().filter((o) => o.label !== "COMBAT.InitiativeReset")
  }

  /* -------------------------------------------- */
  /*  Drag and drop                               */
  /* -------------------------------------------- */

  /**
   * The combatant row under the pointer, and whether the dragged one goes before or after it.
   * @param {DragEvent} event
   * @returns {{li: HTMLElement, after: boolean}|null}
   */
  #getDropTarget(event) {
    const li = event.target.closest(".combatant[data-combatant-id]")
    if (!li) return null
    const rect = li.getBoundingClientRect()
    return { li, after: event.clientY > rect.top + rect.height / 2 }
  }

  /** Remove the drop indicators. */
  #clearDropIndicators() {
    this.element.querySelectorAll(".drop-before, .drop-after").forEach((el) => el.classList.remove("drop-before", "drop-after"))
  }

  #onDragStart(event) {
    const li = event.currentTarget
    const combatant = this.viewed?.combatants.get(li.dataset.combatantId)
    if (!combatant) return
    event.dataTransfer.setData("text/plain", JSON.stringify({ type: "Combatant", uuid: combatant.uuid }))
    event.dataTransfer.effectAllowed = "move"
    li.classList.add("dragging")
  }

  #onDragOver(event) {
    const target = this.#getDropTarget(event)
    this.#clearDropIndicators()
    if (target) target.li.classList.add(target.after ? "drop-after" : "drop-before")
  }

  #onDragLeave(event) {
    if (!this.element.contains(event.relatedTarget)) this.#clearDropIndicators()
  }

  async #onDrop(event) {
    this.#clearDropIndicators()
    this.element.querySelector(".dragging")?.classList.remove("dragging")
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event)
    if (data?.type !== "Combatant") return
    const combat = this.viewed
    const combatant = await fromUuid(data.uuid)
    if (!combat || combatant?.parent !== combat) return

    const target = this.#getDropTarget(event)
    let beforeId = null
    if (target) {
      const turns = combat.turns
      const index = turns.findIndex((c) => c.id === target.li.dataset.combatantId)
      beforeId = target.after ? (turns[index + 1]?.id ?? null) : turns[index].id
    }
    if (beforeId === combatant.id) return
    return combat.moveCombatant(combatant.id, beforeId)
  }

  /* -------------------------------------------- */
  /*  Actions                                     */
  /* -------------------------------------------- */

  /**
   * The combatant of the row of an action target.
   * @param {HTMLElement} target
   * @returns {Combatant|undefined}
   */
  #getCombatant(target) {
    const { combatantId } = target.closest("[data-combatant-id]")?.dataset ?? {}
    return this.viewed?.combatants.get(combatantId)
  }

  /**
   * Mark the Moment of a combatant as done or not. Ending the Moment of the current combatant gives the turn to the next one.
   * @this {CtHackCombatTracker}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onToggleDone(event, target) {
    const combatant = this.#getCombatant(target)
    if (!combatant || !(game.user.isGM || combatant.isOwner)) return
    const combat = this.viewed
    if (!combatant.done && combat.combatant === combatant && combat.canUserModify(game.user, "update", { turn: 0 })) return combat.nextTurn()
    return combatant.setFlag(SYSTEM_NAME, "done", !combatant.done)
  }

  /**
   * Give the turn to a combatant.
   * @this {CtHackCombatTracker}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onSetTurn(event, target) {
    const combatant = this.#getCombatant(target)
    if (!combatant || !game.user.isGM) return
    if (combatant.done) await combatant.unsetFlag(SYSTEM_NAME, "done")
    return this.viewed.setTurn(combatant.id)
  }

  /**
   * Use or recover an attack of an opponent : clicking a free pip uses the attacks up to it, clicking a used pip recovers it and the following ones.
   * @this {CtHackCombatTracker}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onUseAction(event, target) {
    const combatant = this.#getCombatant(target)
    if (!combatant || !game.user.isGM) return
    const index = Number(target.dataset.index)
    const used = index < combatant.actionsUsed ? index : index + 1
    return combatant.setFlag(SYSTEM_NAME, "actionsUsed", used)
  }

  /**
   * Set the number of attacks per round of an opponent ; 0 goes back to the sum of its attacks.
   * @param {Combatant} combatant
   * @returns {Promise<void>}
   */
  async #setActionsMax(combatant) {
    if (!combatant) return
    const override = combatant.getFlag(SYSTEM_NAME, "actionsMax") ?? 0
    const field = new foundry.data.fields.NumberField({
      label: "CTHACK.Combat.ActionsMax",
      hint: "CTHACK.Combat.ActionsMaxHint",
      integer: true,
      min: 0,
    })
    const content = field.toFormGroup({ localize: true }, { name: "actionsMax", value: override, autofocus: true }).outerHTML
    const data = await foundry.applications.api.DialogV2.input({
      window: { icon: "fa-solid fa-hand-fist", title: "CTHACK.Combat.SetActions" },
      position: { width: 400 },
      content,
    })
    if (!data) return
    const value = Number(data.actionsMax) || 0
    if (value > 0) await combatant.setFlag(SYSTEM_NAME, "actionsMax", value)
    else await combatant.unsetFlag(SYSTEM_NAME, "actionsMax")
  }
}
