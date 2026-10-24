import { SYSTEM_NAME } from "../constants.mjs"

/**
 * A combat of Cthulhu Hack : the actions are simultaneous and there is no initiative.
 * The GM orders the combatants (drag and drop in the tracker), each one does its Moment then is marked as done ;
 * a new round clears the Moments done and the attacks used by the opponents.
 */
export default class CtHackCombat extends Combat {
  /**
   * The combatants are sorted by their position in the round, then by id.
   * @override
   */
  _sortCombatants(a, b) {
    return a.sort - b.sort || (a.id > b.id ? 1 : -1)
  }

  /**
   * Can this turn be given to a combatant : its Moment is not done, and it is not defeated when they are skipped.
   * @param {Combatant} combatant
   * @returns {boolean}
   */
  _canPlay(combatant) {
    return !combatant.done && !(this.settings.skipDefeated && combatant.isDefeated)
  }

  /**
   * End the Moment of the current combatant, then give the turn to the next combatant who has not played yet :
   * after the current one, else from the top of the round. When everyone has played, a new round begins.
   * @override
   */
  async nextTurn() {
    if (this.round === 0) return this.nextRound()
    const current = this.combatant
    if (current && !current.done) await current.setFlag(SYSTEM_NAME, "done", true)

    const from = this.turn ?? -1
    const candidates = [...this.turns.slice(from + 1), ...this.turns.slice(0, Math.max(from, 0))]
    const next = candidates.find((c) => this._canPlay(c))
    if (!next) return this.nextRound()
    return this.setTurn(next.id)
  }

  /**
   * Go back to the previous combatant : its Moment is not done anymore.
   * @override
   */
  async previousTurn() {
    if (this.round === 0) return this
    if (this.turn === 0 || this.turns.length === 0) return this.previousRound()
    const previous = this.turns[(this.turn ?? this.turns.length) - 1]
    if (previous?.done && previous.isOwner) await previous.unsetFlag(SYSTEM_NAME, "done")
    return super.previousTurn()
  }

  /**
   * A new round : the Moments done and the attacks used are cleared by the active GM, whoever advanced the round.
   * @inheritDoc
   */
  async _onStartRound(context) {
    await super._onStartRound(context)
    await this.resetRound()
  }

  /**
   * Clear the Moments done and the attacks used of all the combatants.
   * @returns {Promise<void>}
   */
  async resetRound() {
    const updates = this.combatants
      .filter((c) => c.done || c.getFlag(SYSTEM_NAME, "actionsUsed"))
      .map((c) => ({ _id: c.id, [`flags.${SYSTEM_NAME}.done`]: false, [`flags.${SYSTEM_NAME}.actionsUsed`]: 0 }))
    if (updates.length) await this.updateEmbeddedDocuments("Combatant", updates, { turnEvents: false })
  }

  /**
   * Give the turn to a combatant, whatever the order : the actions are simultaneous.
   * @param {string} combatantId The id of the combatant.
   * @returns {Promise<this>}
   */
  async setTurn(combatantId) {
    const turn = this.turns.findIndex((c) => c.id === combatantId)
    if (turn === -1 || turn === this.turn) return this
    const updateData = { round: this.round, turn }
    const updateOptions = { direction: turn > this.turn ? 1 : -1, worldTime: { delta: 0 } }
    Hooks.callAll("combatTurn", this, updateData, updateOptions)
    await this.update(updateData, updateOptions)
    return this
  }

  /**
   * Move a combatant before another one in the round.
   * @param {string} combatantId The id of the moved combatant.
   * @param {string|null} beforeId The id of the combatant placed after it, null to put it at the end.
   * @returns {Promise<void>}
   */
  async moveCombatant(combatantId, beforeId) {
    if (combatantId === beforeId) return
    const order = this.turns.map((c) => c.id).filter((id) => id !== combatantId)
    const index = beforeId ? order.indexOf(beforeId) : -1
    order.splice(index === -1 ? order.length : index, 0, combatantId)
    const updates = order.map((id, i) => ({ _id: id, [`flags.${SYSTEM_NAME}.sort`]: i + 1 })).filter((u) => this.combatants.get(u._id).sort !== u[`flags.${SYSTEM_NAME}.sort`])
    if (updates.length) await this.updateEmbeddedDocuments("Combatant", updates)
  }

  /** @override No initiative in Cthulhu Hack */
  async rollInitiative(ids, options) {
    return this
  }

  /** @override No initiative in Cthulhu Hack */
  async rollAll(options) {
    return this
  }

  /** @override No initiative in Cthulhu Hack */
  async rollNPC(options) {
    return this
  }

  /** @override No initiative in Cthulhu Hack */
  async resetAll(options) {
    return this
  }
}
