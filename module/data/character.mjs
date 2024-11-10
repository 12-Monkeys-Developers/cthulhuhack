import { SYSTEM, ROLL_TYPE } from "../config/system.mjs"
import CtHackRoll from "../documents/roll.mjs"
import { CthackUtils } from "../utils.js"

export default class CtHackCharacter extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}

    schema.locked = new fields.BooleanField({ required: true, nullable: false, initial: false })

    // Saves
    const saveField = (label) => {
      const schema = {
        value: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 10, min: 0 }),
        advantage: new fields.BooleanField({ required: true, nullable: false, initial: false }),
      }
      return new fields.SchemaField(schema, { label })
    }
    schema.saves = new fields.SchemaField(
      Object.values(SYSTEM.SAVES).reduce((obj, save) => {
        obj[save.id] = saveField(save.label)
        return obj
      }, {})
    )

    // Resources : attribute
    const resourceField = (label) => {
      const schema = {
        value: new fields.StringField({ required: false, blank: true, initial: "d6" }),
        max: new fields.StringField({ required: false, blank: true, initial: "d6" }),
      }
      return new fields.SchemaField(schema, { label })
    }
    const damageField = (label) => {
      const schema = {
        value: new fields.StringField({ required: false, blank: true, initial: "d6" }),
      }
      return new fields.SchemaField(schema, { label })
    }
    const adrenalineField = (label) => {
      const schema = {
        value: new fields.StringField({ required: false, blank: true, initial: "pj" }),
      }
      return new fields.SchemaField(schema, { label })
    }

    const resourcesObject = Object.values(SYSTEM.RESOURCES).reduce((obj, item) => {
      obj[item.id] = resourceField(item.label)
      return obj
    }, {})

    const savesObject = Object.values(SYSTEM.DAMAGES).reduce((obj, item) => {
      obj[item.id] = damageField(item.label)
      return obj
    }, {})

    const adrenalineObject = Object.values(SYSTEM.ADRENALINE).reduce((obj, item) => {
      obj[item.id] = adrenalineField(item.label)
      return obj
    }, {})

    const attributes = { ...resourcesObject, ...savesObject, ...adrenalineObject }

    schema.attributes = new fields.SchemaField(attributes)

    schema.shortDescription = new fields.HTMLField({ required: false, blank: true, textSearch: true })
    schema.biography = new fields.HTMLField({ required: false, blank: true, textSearch: true })
    schema.notes = new fields.HTMLField({ required: false, blank: true, textSearch: true })
    schema.equipment = new fields.HTMLField({ required: false, blank: true, textSearch: true })
    schema.archetype = new fields.StringField({ required: false, blank: true })
    schema.occupation = new fields.StringField({ required: false, blank: true })
    schema.skills = new fields.StringField({ required: false, blank: true })
    schema.abilities = new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField({ required: false, blank: true }),
        key: new fields.StringField({ required: true, blank: false, nullable: false }),
      })
    )

    schema.hp = new fields.SchemaField({
      value: new fields.NumberField({ required: true, nullable: false, initial: 10, min: 0 }),
      min: new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 }),
      max: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 10 }),
    })

    return schema
  }

  get hasShortDescription() {
    return !!this.shortDescription
  }

  get hasOccupation() {
    return !!this.occupation
  }

  get hasArchetype() {
    return !!this.archetype
  }

  get hasSkills() {
    return !!this.skills
  }

  get infos() {
    const abilities = this.parent.itemTypes.ability
    const abilitiesTitle = game.i18n.localize("CTHACK.Abilities")
    const abilitiesName = abilities.map((ability) => ability.name)

    const magics = this.parent.itemTypes.magic
    const magicsTitle = game.i18n.localize("CTHACK.Magic")
    const magicsName = magics.map((magic) => magic.name)
    return `${abilitiesTitle} : ${abilitiesName.join(", ")} <br/> ${magicsTitle} : ${magicsName.join(", ")}`
  }

  /**
   * Rolls a dice for a character.
   * @param {("save"|"resource|damage")} rollType The type of the roll.
   * @param {number} rollTarget The target value for the roll. Which caracteristic or resource. If the roll is a damage roll, this is the id of the item.
   * @param {"="|"+"|"++"|"-"|"--"} rollAdvantage If there is an avantage (+), a disadvantage (-), a double advantage (++), a double disadvantage (--) or a normal roll (=).
   * @returns {Promise<null>} - A promise that resolves to null if the roll is cancelled.
   */
  async roll(rollType, rollTarget, rollAdvantage = "=") {
    let rollValue
    let opponentTarget
    switch (rollType) {
      case ROLL_TYPE.SAVE:
        rollValue = this.saves[rollTarget].value
        opponentTarget = game.user.targets.first()
        break
      case ROLL_TYPE.RESOURCE:
        rollValue = this.attributes[rollTarget].value
        break
      case ROLL_TYPE.DAMAGE:
        rollValue = this.parent.items.get(rollTarget).system.degats
        opponentTarget = game.user.targets.first()
        break
      default:
        // Handle other cases or do nothing
        break
    }
    await this._roll(rollType, rollTarget, rollValue, opponentTarget, rollAdvantage)
  }

  /**
   * Rolls a dice for a character.
   * @param {("save"|"resource|damage")} rollType The type of the roll.
   * @param {number} rollTarget The target value for the roll. Which caracteristic or resource. If the roll is a damage roll, this is the id of the item.
   * @param {number} rollValue The value of the roll. If the roll is a damage roll, this is the dice to roll.
   * @param {Token} opponentTarget The target of the roll : used for save rolls to get the oppponent's malus.
   * @param {"="|"+"|"++"|"-"|"--"} rollAdvantage If there is an avantage (+), a disadvantage (-), a double advantage (++), a double disadvantage (--) or a normal roll (=).
   * @returns {Promise<null>} - A promise that resolves to null if the roll is cancelled.
   */
  async _roll(rollType, rollTarget, rollValue, opponentTarget = undefined, rollAdvantage = "=") {
    const hasTarget = opponentTarget !== undefined
    let roll = await CtHackRoll.prompt({
      rollType,
      rollTarget,
      rollValue,
      actorId: this.parent.id,
      actorName: this.parent.name,
      actorImage: this.parent.img,
      hasTarget,
      target: opponentTarget,
      rollAdvantage,
    })
    if (!roll) return null

    // Perte de ressouces
    if (rollType === ROLL_TYPE.RESOURCE && roll.resultType === "failure") {
      const value = this.attributes[rollTarget].value
      const newValue = CthackUtils.findLowerDice(value)
      await this.parent.update({ [`system.attributes.${rollTarget}.value`]: newValue })
    }
    await roll.toMessage({}, { rollMode: roll.options.rollMode })
  }

  getSaveModifiers(saveId) {
    return this.parent.findSavesAdvantages(saveId);
  }
}
