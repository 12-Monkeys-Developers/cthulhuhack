import CtHackRoll from "../documents/roll.mjs"
import { CthackUtils } from "../utils.mjs"
import { COMBAT_STATUS } from "../data/card-message.mjs"

/**
 * Actions of the chat cards : roll the damage of a combat card, apply damage to an opponent.
 * The card is always updated in place : the new roll is added to the message rolls and the card data is updated.
 */
export class CombatCard {
  /**
   * Roll the damage of the character, armed or unarmed as declared in the roll dialog, after a successful attack.
   * @param {ChatMessage} message The combat card.
   * @returns {Promise<void>}
   */
  static async rollPlayerDamage(message) {
    const system = message.system
    if (!system.canRollPlayerDamage()) return
    const actor = await fromUuid(system.actor.uuid)
    if (!actor) return
    const damageId = system.playerDamageId
    const roll = await new Roll(actor.system.attributes[damageId].value).evaluate()
    const damage = CtHackRoll.computeDamage(roll, {
      side: "character",
      source: game.i18n.localize(`CTHACK.Character.damage.${damageId}`),
      target: system.target,
    })
    await CombatCard.updateCard(message, { combat: COMBAT_STATUS.RESOLVED, damage }, roll)
  }

  /**
   * Roll the damage of the opponent, after a failed weapon roll : the GM chooses the attack, then its damage is rolled (or the fixed damage is used).
   * @param {ChatMessage} message The combat card.
   * @returns {Promise<void>}
   */
  static async rollOpponentDamage(message) {
    const system = message.system
    if (!game.user.isGM || system.combat !== COMBAT_STATUS.AWAITING_GM) return
    const opponent = await fromUuid(system.target?.uuid)
    const attack = await CombatCard.chooseAttack(opponent, { victim: system.actor })
    if (!attack) return
    // Une attaque à dégâts fixes donne un jet constant : pas de dé, mais le même affichage
    const roll = await new Roll(attack.system.damageFormula).evaluate()
    const damage = CtHackRoll.computeDamage(roll, { side: "opponent", source: attack.name, target: system.actor })
    await CombatCard.updateCard(message, { combat: COMBAT_STATUS.RESOLVED, damage }, roll)
  }

  /**
   * Ask the GM to choose the attack of an opponent. The dialog is displayed even with one attack.
   * @param {Actor} opponent The opponent.
   * @param {Object} [options]
   * @param {Object} [options.victim] The participant hit by the attack : name and image.
   * @returns {Promise<Item|null>} The chosen attack.
   */
  static async chooseAttack(opponent, { victim } = {}) {
    const attacks = CthackUtils.getDamagingAttacks(opponent)
    if (!attacks.length) {
      ui.notifications.warn(game.i18n.format("CTHACK.Card.noDamagingAttack", { name: opponent?.name ?? "" }))
      return null
    }
    const content = await foundry.applications.handlebars.renderTemplate("systems/cthack/templates/dialog/choose-attack.hbs", {
      opponent: CthackUtils.getActorInfo(opponent),
      victim,
      attacks: attacks.map((a, index) => ({
        id: a.id,
        name: a.name,
        img: a.img,
        formula: a.system.damageFormula,
        isFixed: !a.system.hasDamageDice,
        nb: a.system.nb,
        checked: index === 0,
      })),
    })
    const attackId = await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.localize("CTHACK.Dialog.chooseOpponentAttack"), icon: "fa-solid fa-skull" },
      classes: ["cthack", "cthack-choose-attack"],
      position: { width: 420 },
      content,
      buttons: [
        {
          action: "roll",
          label: game.i18n.localize("CTHACK.Card.rollDamage"),
          icon: "fa-solid fa-dice",
          default: true,
          callback: (event, button) => button.form.elements.attackId.value,
        },
      ],
      rejectClose: false,
    })
    return attacks.find((a) => a.id === attackId) ?? null
  }

  /**
   * Apply the real damage (armor deducted for an opponent) to the hit points of the victim : the opponent or the character.
   * @param {ChatMessage} message The card.
   * @returns {Promise<void>}
   */
  static async applyDamage(message) {
    const system = message.system
    if (!game.user.isGM || !system.canApplyDamage || system.damage.applied) return
    const victim = await fromUuid(system.victim.uuid)
    if (!victim) return ui.notifications.warn(game.i18n.format("CTHACK.Card.targetNotFound", { name: system.victim.name }))
    const hpBefore = victim.system.hp.value
    const hpAfter = Math.max(0, hpBefore - system.damage.real)
    await victim.update({ "system.hp.value": hpAfter })
    await CombatCard.updateCard(message, { damage: { applied: true, hpBefore, hpAfter } })
  }

  /**
   * Roll the Hit Dice of the wounded character (health managed with the Hit Dice) : a resource roll, on its own card.
   * The damage card then records that the roll has been made.
   * @param {ChatMessage} message The card.
   * @returns {Promise<void>}
   */
  static async rollHitDice(message) {
    const system = message.system
    if (!system.canRollHitDice()) return
    const character = await fromUuid(system.victim.uuid)
    if (!character) return ui.notifications.warn(game.i18n.format("CTHACK.Card.targetNotFound", { name: system.victim.name }))
    const roll = await character.rollResource("hitDice")
    // Jet annulé, ou Dé de vie déjà à 0 : la carte reste en attente
    if (!roll) return
    const changes = { hitDiceRolled: true }
    if (system.combat === COMBAT_STATUS.AWAITING_HIT_DICE) changes.combat = COMBAT_STATUS.RESOLVED
    await CombatCard.updateCard(message, changes)
  }

  /**
   * Center the canvas on a token of the card and control it.
   * @param {string} tokenUuid The uuid of the token.
   */
  static panToToken(tokenUuid) {
    const token = fromUuidSync(tokenUuid)?.object
    if (!token || token.document.parent !== canvas.scene) return
    if (token.isOwner) token.control({ releaseOthers: true })
    canvas.animatePan(token.center)
  }

  /**
   * Update a card in place : the card data, and the new roll added to the message rolls.
   * A user who cannot modify the message (a player who is not its author) asks the active GM to do it.
   * @param {ChatMessage} message The card.
   * @param {Object} systemChanges The changes of the card data.
   * @param {Roll} [roll] The new roll.
   * @returns {Promise<void>}
   */
  static async updateCard(message, systemChanges, roll) {
    const updateData = { system: systemChanges }
    if (roll) updateData.rolls = [...message.rolls, roll].map((r) => r.toJSON())
    if (message.canUserModify(game.user, "update")) {
      await message.update(updateData)
      return
    }
    const gm = game.users.activeGM
    if (!gm) {
      ui.notifications.warn(game.i18n.localize("CTHACK.Card.noActiveGM"))
      return
    }
    await gm.query("cthack.updateCard", { messageId: message.id, updateData })
  }

  /**
   * Handle the "cthack.updateCard" query on the GM side : only the card data and the rolls can be updated,
   * by a user who can roll the character's damage or the Hit Dice of the wounded character (the only actions of a player on a card).
   * @param {Object} data
   * @param {string} data.messageId The id of the card.
   * @param {Object} data.updateData The update with the card data and the rolls.
   * @param {Object} context
   * @param {User} context.user The user who sent the query.
   * @returns {Promise<boolean>} Whether the card has been updated.
   */
  static async _handleUpdateQuery({ messageId, updateData }, { user }) {
    const message = game.messages.get(messageId)
    if (message?.type !== "card") return false
    if (!message.system.canRollPlayerDamage(user) && !message.system.canRollHitDice(user)) return false
    const { system, rolls } = updateData
    await message.update(rolls ? { system, rolls } : { system })
    return true
  }
}
