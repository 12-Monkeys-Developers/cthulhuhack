import { ROLL_TYPE } from "../config/system.mjs"

/**
 * Card status of a combat card (weapon roll with simultaneous damage).
 * @type {Readonly<Record<string, string>>}
 */
export const COMBAT_STATUS = Object.freeze({
  NONE: "",
  AWAITING_PLAYER: "awaitingPlayerDamage",
  AWAITING_GM: "awaitingGmDamage",
  AWAITING_HIT_DICE: "awaitingHitDice",
  RESOLVED: "resolved",
  NO_DAMAGE: "noDamage",
})

/**
 * Data of a chat message of type "card": every roll card of the system.
 * The card is rendered from this data and the message rolls (rolls[0] : the main roll, rolls[1] : the damage roll of a combat card).
 */
export default class CtHackCardMessage extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const participant = () => ({
      uuid: new fields.StringField({ required: true, blank: true, initial: "" }),
      tokenUuid: new fields.StringField({ required: true, blank: true, initial: "" }),
      name: new fields.StringField({ required: true, blank: true, initial: "" }),
      img: new fields.StringField({ required: true, blank: true, initial: "" }),
      type: new fields.StringField({ required: true, blank: true, initial: "" }),
    })
    return {
      rollType: new fields.StringField({ required: true, choices: Object.values(ROLL_TYPE), initial: ROLL_TYPE.SAVE }),
      // Label of the roll : the save, the resource, the item or the attack
      label: new fields.StringField({ required: true, blank: true, initial: "" }),
      itemName: new fields.StringField({ required: true, blank: true, initial: "" }),
      actor: new fields.SchemaField(participant()),
      target: new fields.SchemaField(
        {
          ...participant(),
          armor: new fields.NumberField({ required: true, nullable: true, initial: null }),
          malus: new fields.NumberField({ required: true, nullable: true, initial: null }),
        },
        { nullable: true, initial: null },
      ),
      targetsCount: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
      // Save or weapon roll : how the threshold is computed
      check: new fields.SchemaField({
        base: new fields.NumberField({ required: true, nullable: true, integer: true, initial: null }),
        adversity: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
        threshold: new fields.NumberField({ required: true, nullable: true, integer: true, initial: null }),
        hiddenMalus: new fields.NumberField({ required: true, nullable: true, initial: null }),
        modifiers: new fields.ArrayField(new fields.StringField()),
      }),
      advantage: new fields.StringField({ required: true, blank: true, initial: "" }),
      result: new fields.StringField({ required: true, blank: true, choices: ["", "success", "failure"], initial: "" }),
      // Resource, material or sanity roll : dice lost on a failure
      resource: new fields.SchemaField({
        from: new fields.StringField({ required: true, blank: true, initial: "" }),
        to: new fields.StringField({ required: true, blank: true, initial: "" }),
      }),
      // Damage dealt : by the damage roll itself, or by the damage roll of a combat card
      damage: new fields.SchemaField(
        {
          side: new fields.StringField({ required: true, choices: ["character", "opponent"], initial: "character" }),
          source: new fields.StringField({ required: true, blank: true, initial: "" }),
          formula: new fields.StringField({ required: true, blank: true, initial: "" }),
          total: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
          armor: new fields.NumberField({ required: true, nullable: false, min: 0, initial: 0 }),
          real: new fields.NumberField({ required: true, nullable: false, min: 0, initial: 0 }),
          applied: new fields.BooleanField({ required: true, initial: false }),
          hpBefore: new fields.NumberField({ required: true, nullable: true, initial: null }),
          hpAfter: new fields.NumberField({ required: true, nullable: true, initial: null }),
        },
        { nullable: true, initial: null },
      ),
      // Santé gérée en Dés de vie : le personnage blessé fait un jet de ressource de son Dé de vie au lieu de perdre des PV
      hitDiceRolled: new fields.BooleanField({ required: true, initial: false }),
      // Attaque déclarée dans la fenêtre de jet : clé de l'attribut de dégâts du personnage (armé ou sans arme)
      attackDamage: new fields.StringField({ required: true, blank: true, choices: ["", "armedDamage", "unarmedDamage"], initial: "" }),
      combat: new fields.StringField({ required: true, blank: true, choices: Object.values(COMBAT_STATUS), initial: COMBAT_STATUS.NONE }),
    }
  }

  /** @type {boolean} Is it a combat card : weapon roll then damage on the same card */
  get isCombat() {
    return this.combat !== COMBAT_STATUS.NONE
  }

  /** @type {boolean} Is the declared attack unarmed */
  get isUnarmed() {
    return this.attackDamage === "unarmedDamage"
  }

  /** @type {string} The damage attribute of the character for a combat card : armed by default (cards created before the attack choice) */
  get playerDamageId() {
    return this.attackDamage || "armedDamage"
  }

  /** @type {boolean} Is it a save or a weapon roll */
  get isCheck() {
    return this.rollType === ROLL_TYPE.SAVE || this.rollType === ROLL_TYPE.WEAPON
  }

  /** @type {boolean} Is it a resource, a material or a sanity roll */
  get isResource() {
    return [ROLL_TYPE.RESOURCE, ROLL_TYPE.MATERIAL, ROLL_TYPE.SANITY].includes(this.rollType)
  }

  /** @type {boolean} Is it a damage roll : character's damage or opponent's attack */
  get isDamage() {
    return this.rollType === ROLL_TYPE.DAMAGE || this.rollType === ROLL_TYPE.ATTACK
  }

  /**
   * The participant who takes the damage : the target of the character's damage,
   * the character for the riposte of a combat card, the target of an opponent's attack.
   * @type {Object|null}
   */
  get victim() {
    // Riposte en Dés de vie : pas de jet de dégâts, le personnage fait directement son jet de Dé de vie
    if (this.isCombat && !this.damage && (this.combat === COMBAT_STATUS.AWAITING_HIT_DICE || this.hitDiceRolled)) return this.actor
    if (!this.damage) return null
    if (this.damage.side === "opponent" && this.isCombat) return this.actor
    return this.target
  }

  /**
   * Is the health of the victim managed with its Hit Dice instead of its hit points :
   * a character, when the "HealthDisplay" setting only displays the Hit Dice.
   * @type {boolean}
   */
  get victimUsesHitDice() {
    return this.victim?.type === "character" && game.settings.get("cthack", "HealthDisplay") === "hd"
  }

  /** @type {boolean} The victim is a character or an opponent whose hit points can be reduced */
  get canApplyDamage() {
    const victim = this.victim
    return !!victim?.uuid && ["character", "opponent"].includes(victim.type) && !this.victimUsesHitDice
  }

  /**
   * Can the user roll the Hit Dice of the wounded character : its owner or the GM
   * @param {User} user
   * @returns {boolean}
   */
  canRollHitDice(user = game.user) {
    if (!this.victimUsesHitDice || this.hitDiceRolled || !this.victim.uuid) return false
    if (user.isGM) return true
    const actor = fromUuidSync(this.victim.uuid)
    return !!actor?.testUserPermission(user, "OWNER")
  }

  /** @type {Roll|undefined} The damage roll : the first roll of a damage card, the second one of a combat card */
  get damageRoll() {
    return this.parent.rolls[this.isCombat ? 1 : 0]
  }

  /**
   * Can the user roll the character's damage of a combat card : the owner of the character or the GM
   * @param {User} user
   * @returns {boolean}
   */
  canRollPlayerDamage(user = game.user) {
    if (this.combat !== COMBAT_STATUS.AWAITING_PLAYER) return false
    if (user.isGM) return true
    const actor = fromUuidSync(this.actor.uuid)
    return !!actor?.testUserPermission(user, "OWNER")
  }
}
