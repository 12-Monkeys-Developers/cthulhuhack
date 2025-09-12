import { SYSTEM, ROLL_TYPE } from "../config/system.mjs"
import CtHackRoll from "../documents/roll.mjs"
import { CthackUtils } from "../utils.mjs"

export default class CtHackCharacter extends foundry.abstract.TypeDataModel {
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

    // Encombrement : géré via une option, utilisé pour le module Section 13
    schema.encumbrance = new fields.SchemaField({
      value: new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 }),
      max: new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 }),
    })

    return schema
  }

  /** @inheritDoc */
  prepareBaseData() {
    // Encombrement si l'option est activée
    if (game.settings.get("cthack", "useSize")) {
      const items = this.parent.items.filter((i) => i.type === "item" || i.type === "weapon")
      const totalEncumbrance = items.reduce((total, item) => {
        // si le status est équipé ou non équippé, on prend la bonne valeur
        const size = item.system.size.status === "equipped" ? item.system.size.equipped : (item.system.size.status === "unequipped" ? item.system.size.unequipped : 0)
        return total + size
      }, 0)
      this.encumbrance.value = totalEncumbrance
    } 
  }

  //#region Getters
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

    if (abilities.length === 0 && magics.length === 0) return ""
    if (abilities.length === 0) return `${magicsTitle} : ${magicsName.join(", ")}`
    if (magics.length === 0) return `${abilitiesTitle} : ${abilitiesName.join(", ")}`
    
    return `${abilitiesTitle} : ${abilitiesName.join(", ")} <br/> ${magicsTitle} : ${magicsName.join(", ")}`
  }

  //#endregion

  /**
   * Perform a roll based on the specified roll type and target.
   *
   * @param {string} rollType - The type of roll to perform (e.g., SAVE, WEAPON, RESOURCE, DAMAGE, MATERIAL, SANITY).
   * @param {string} rollTarget - The target of the roll, which can be a save, attribute, or item. If the roll is a damage roll, this is the id of the item.
   * @param {Object} [options={}] - Additional options for the roll.
   * @param {string} [options.rollAdvantage="="] - The advantage or disadvantage for the roll. If there is an avantage (+), a disadvantage (-), a double advantage (++), a double disadvantage (--) or a normal roll (=).
   * @returns {Promise<void>} - A promise that resolves when the roll is complete.
   */
  async roll(rollType, rollTarget, options = {}) {
    const { rollAdvantage = "=" } = options;
    let rollValue, opponentTarget;
    let rollOptions = {}
    switch (rollType) {
      case ROLL_TYPE.SAVE:
        rollValue = this.saves[rollTarget].value
        opponentTarget = game.user.targets.first()
        break
      case ROLL_TYPE.WEAPON:
        rollValue = this.saves[rollTarget].value
        opponentTarget = game.user.targets.first()
        rollOptions.itemName = options.itemName
        break
      case ROLL_TYPE.RESOURCE:
        rollValue = this.attributes[rollTarget].value
        break
      case ROLL_TYPE.DAMAGE:
        rollValue = this.attributes[rollTarget].value
        opponentTarget = game.user.targets.first()
        break
      case ROLL_TYPE.MATERIAL:
        rollValue = this.parent.items.get(rollTarget).system.dice
        break
      case ROLL_TYPE.SANITY:
        rollValue = this.parent.items.get(rollTarget).system.dice
        break
      default:
        // Handle other cases or do nothing
        break      
    }
    await this._roll(rollType, rollTarget, rollValue, opponentTarget, rollAdvantage, rollOptions)
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
  async _roll(rollType, rollTarget, rollValue, opponentTarget = undefined, rollAdvantage = "=", rollOptions = {}) {
    // console.log("Rolling", rollType, rollTarget, rollValue, opponentTarget, rollAdvantage)
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
      itemName: rollOptions.itemName ? rollOptions.itemName : undefined,
    })
    if (!roll) return null

    await roll.toMessage({}, { rollMode: roll.options.rollMode })

    // Perte de ressouce pour un jet de ressource
    if (rollType === ROLL_TYPE.RESOURCE && roll.resultType === "failure") {
      const value = this.attributes[rollTarget].value
      const newValue = CthackUtils.findLowerDice(value)
      await this.parent.update({ [`system.attributes.${rollTarget}.value`]: newValue })
    }

    // Perte de ressource pour un jet de matériel
    if (rollType === ROLL_TYPE.MATERIAL && roll.resultType === "failure") {
      const item = this.parent.items.get(rollTarget)
      const value = item.system.dice
      const newValue = CthackUtils.findLowerDice(value)
      await item.update({ "system.dice": newValue })
    }

    // Perte de ressource pour un jet de sanité
    if (rollType === ROLL_TYPE.SANITY && roll.resultType === "failure") {
      const item = this.parent.items.get(rollTarget)
      const value = item.system.dice
      const newValue = CthackUtils.findLowerDice(value)
      await item.update({ "system.dice": newValue })
    }
  }

  getSaveModifiers(saveId) {
    return this.parent.findSavesAdvantages(saveId)
  }
}
