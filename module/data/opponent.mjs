import CtHackRoll from "../documents/roll.mjs"
import { ROLL_TYPE } from "../config/system.mjs"
import { CthackUtils } from "../utils.mjs"
export default class CtHackOpponent extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}
    schema.description = new fields.HTMLField({ required: false, blank: true, textSearch: true })
    schema.shortDescription = new fields.HTMLField({ required: false, blank: true, textSearch: true })
    schema.locked = new fields.BooleanField({ required: true, nullable: false, initial: false })
    schema.hitDice = new fields.NumberField({ required: true, nullable: false, integer: true, positive: true, initial: 1, min: 1 })
    schema.armor = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 })
    schema.malus = new fields.NumberField({ required: true, nullable: false, initial: 0 })
    schema.hp = new fields.SchemaField({
      value: new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 }),
      min: new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 }),
      max: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    })

    return schema
  }

  /**
   * Rolls a dice attack for an opponent.
   * @param {number} rollValue The dice to roll.
   * @param {number} rollTarget The name of the attack
   * @returns {Promise<null>} - A promise that resolves to null if the roll is cancelled.
   */
  async rollAttack(rollValue, rollTarget) {
    let roll = await CtHackRoll.prompt({
      rollType: ROLL_TYPE.ATTACK,
      rollValue,
      rollTarget,
      actorId: this.parent.id,
      actorName: this.parent.name,
      actorImage: this.parent.img,
    })
    if (!roll) return null
    await roll.toMessage({}, { rollMode: roll.options.rollMode })
  }

  async rollSanity(rollTarget) {
    const rollValue = this.parent.items.get(rollTarget).system.dice
    let roll = await CtHackRoll.prompt({
      rollType: ROLL_TYPE.SANITY,
      rollValue,
      rollTarget,
      actorId: this.parent.id,
      actorName: this.parent.name,
      actorImage: this.parent.img,
    })
    if (!roll) return null
    await roll.toMessage({}, { rollMode: roll.options.rollMode })

    // Perte de ressource pour un jet de sanité
    if (roll.resultType === "failure") {
      const item = this.parent.items.get(rollTarget)
      const value = item.system.dice
      const newValue = CthackUtils.findLowerDice(value)
      await item.update({ "system.dice": newValue })
    }
  }
}
