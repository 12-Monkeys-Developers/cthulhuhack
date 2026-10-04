import { SYSTEM, ROLL_TYPE } from "../config/system.mjs"
import CtHackRoll from "../documents/roll.mjs"
import { CthackUtils } from "../utils.mjs"
import { COMBAT_STATUS } from "./card-message.mjs"
import { CombatCard } from "../chat/combat-card.mjs"

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
      }, {}),
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
      }),
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
        const size = item.system.size.status === "equipped" ? item.system.size.equipped : item.system.size.status === "unequipped" ? item.system.size.unequipped : 0
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
   * Out of Action conditions which give a disadvantage to saves and weapon rolls (Mild concussion, Staggered, Winded).
   * Computed from the condition items, so that removing one condition keeps the disadvantage of another.
   * @type {boolean}
   */
  get hasOutOfActionDisadvantage() {
    return this.parent.itemTypes.definition.some((item) => ["OOA-MIC", "OOA-STA", "OOA-WIN"].includes(item.system.key))
  }

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
    // "normal" : no advantage, as sent by roll requests created before 6.2.0
    let rollAdvantage = !options.rollAdvantage || options.rollAdvantage === "normal" ? "=" : options.rollAdvantage
    if ((rollType === ROLL_TYPE.SAVE || rollType === ROLL_TYPE.WEAPON) && this.hasOutOfActionDisadvantage) {
      rollAdvantage = CtHackRoll.addDisadvantage(rollAdvantage)
    }
    let rollValue, opponentTarget
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
    return await this._roll(rollType, rollTarget, rollValue, opponentTarget, rollAdvantage, rollOptions)
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
    const hasTarget = opponentTarget !== undefined
    let roll = await CtHackRoll.prompt({
      rollType,
      rollTarget,
      rollValue,
      actorId: this.parent.id,
      actorUuid: this.parent.uuid,
      actorName: this.parent.name,
      actorImage: this.parent.img,
      hasTarget,
      target: opponentTarget,
      rollAdvantage,
      itemName: rollOptions.itemName ? rollOptions.itemName : undefined,
    })
    if (!roll) return null

    const failed = roll.resultType === "failure"
    const system = {}

    // Perte de ressource pour un jet de ressource, de matériel ou de sanité : le dé perdu est affiché dans la carte
    let lostResource
    if (failed && [ROLL_TYPE.RESOURCE, ROLL_TYPE.MATERIAL, ROLL_TYPE.SANITY].includes(rollType)) {
      const from = rollType === ROLL_TYPE.RESOURCE ? this.attributes[rollTarget].value : this.parent.items.get(rollTarget).system.dice
      lostResource = { from, to: CthackUtils.findLowerDice(from) }
      system.resource = lostResource
    }

    // Attaque déclarée contre un Opposant : carte de combat, les dégâts (armés ou sans arme) sont lancés ensuite sur la même carte
    const attackDamage = roll.options.attack
    if (attackDamage && opponentTarget?.actor?.type === "opponent") {
      system.attackDamage = attackDamage
      system.combat = this._getCombatStatus(roll.resultType, opponentTarget.actor, attackDamage)
    }

    const message = await roll.toMessage({ system }, { messageMode: roll.options.rollMode })

    // Dégâts simultanés : les dégâts du personnage sont lancés tout de suite, sans attendre le bouton de la carte
    if (system.combat === COMBAT_STATUS.AWAITING_PLAYER && game.settings.get("cthack", "simultaneousDamage")) {
      await CombatCard.rollPlayerDamage(message)
    }

    if (lostResource) {
      if (rollType === ROLL_TYPE.RESOURCE) await this.parent.update({ [`system.attributes.${rollTarget}.value`]: lostResource.to })
      else await this.parent.items.get(rollTarget).update({ "system.dice": lostResource.to })
    }
    return roll
  }

  /**
   * The status of the combat card after an attack (weapon roll or save declared as an attack) against an opponent.
   * On success the character deals its armed or unarmed damage (rolled from the card, or at once with simultaneous damage),
   * on failure the opponent deals damage (the GM chooses the attack from the card),
   * or, when the health is managed with the Hit Dice, the character rolls its Hit Dice.
   * @param {"success"|"failure"} resultType The result of the weapon roll.
   * @param {CtHackActor} opponent The targeted opponent.
   * @param {"armedDamage"|"unarmedDamage"} attackDamage The damage attribute of the declared attack.
   * @returns {string} The combat status of the card.
   */
  _getCombatStatus(resultType, opponent, attackDamage) {
    if (resultType === "success") {
      const dice = this.attributes[attackDamage].value
      return dice && dice !== "0" ? COMBAT_STATUS.AWAITING_PLAYER : COMBAT_STATUS.NO_DAMAGE
    }
    if (!CthackUtils.getDamagingAttacks(opponent).length) return COMBAT_STATUS.NO_DAMAGE
    // Santé en Dés de vie : pas de choix d'attaque par le MJ, le personnage fait directement son jet de Dé de vie
    if (game.settings.get("cthack", "HealthDisplay") === "hd") return COMBAT_STATUS.AWAITING_HIT_DICE
    return COMBAT_STATUS.AWAITING_GM
  }

  getSaveModifiers(saveId) {
    return this.parent.findSavesAdvantages(saveId)
  }
}
