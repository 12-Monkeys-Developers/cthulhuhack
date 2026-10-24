import { SYSTEM_NAME } from "../constants.mjs"

/**
 * A combatant of Cthulhu Hack : no initiative, a position in the round chosen by the GM, a Moment done or not,
 * and for an opponent the number of attacks used during the round.
 * The state is stored in the flags : sort (position), done (Moment done), actionsUsed, actionsMax (override of the number of attacks).
 */
export default class CtHackCombatant extends Combatant {
  /** @type {number} The position of the combatant in the round */
  get sort() {
    return this.getFlag(SYSTEM_NAME, "sort") ?? 0
  }

  /** @type {boolean} Has the combatant done its Moment during the current round */
  get done() {
    return this.getFlag(SYSTEM_NAME, "done") ?? false
  }

  /** @type {boolean} Are the actions of the combatant tracked : the opponents, who have several attacks per round */
  get hasActions() {
    return this.actor?.type === "opponent"
  }

  /**
   * The number of actions per round : the GM's override, or the sum of the opponent's attacks (Claw x 3 counts for 3), at least 1.
   * @type {number}
   */
  get actionsMax() {
    const override = this.getFlag(SYSTEM_NAME, "actionsMax")
    if (Number.isInteger(override) && override > 0) return override
    const attacks = this.actor?.itemTypes.attack ?? []
    return Math.max(
      attacks.reduce((total, attack) => total + (attack.system.nb ?? 1), 0),
      1,
    )
  }

  /** @type {number} The number of actions used during the current round */
  get actionsUsed() {
    return Math.clamp(this.getFlag(SYSTEM_NAME, "actionsUsed") ?? 0, 0, this.actionsMax)
  }

  /** @type {number} The number of actions left for the current round */
  get actionsLeft() {
    return this.actionsMax - this.actionsUsed
  }

  /** @override No initiative in Cthulhu Hack */
  async rollInitiative(formula) {
    return this
  }

  /**
   * New combatants are placed at the end of the round, in the order of their creation.
   * @inheritDoc
   */
  static async _preCreateOperation(documents, operation, user) {
    const combat = operation.parent
    let sort = Math.max(0, ...(combat?.combatants.map((c) => c.sort) ?? []))
    for (const combatant of documents) {
      if (combatant.getFlag(SYSTEM_NAME, "sort") === undefined) combatant.updateSource({ [`flags.${SYSTEM_NAME}.sort`]: ++sort })
    }
    return super._preCreateOperation(documents, operation, user)
  }
}
