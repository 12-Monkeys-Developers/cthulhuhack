import CtHackRoll from "../documents/roll.mjs"
import { CthackUtils } from "../utils.mjs"
import { COMBAT_STATUS } from "../data/card-message.mjs"
import { SYSTEM } from "../config/system.mjs"
import CtHackCombat from "../documents/combat.mjs"

/**
 * Actions of the chat cards : roll the damage of a combat card, apply damage to an opponent, ask a character to defend against an opponent's attack.
 * The card is always updated in place : the new roll is added to the message rolls and the card data is updated.
 */
export class CombatCard {
  /**
   * The advantages of the slider, from 1 (double disadvantage) to 5 (double advantage).
   * @type {string[]}
   */
  static ADVANTAGES = ["--", "-", "=", "+", "++"]

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
   * Choose the damage of the opponent, after a failed weapon roll : the GM chooses the attack, the fixed damage is used at once, the damage dice are rolled by the player.
   * @param {ChatMessage} message The combat card.
   * @returns {Promise<void>}
   */
  static async rollOpponentDamage(message) {
    const system = message.system
    if (!game.user.isGM || system.combat !== COMBAT_STATUS.AWAITING_GM) return
    const opponent = await fromUuid(system.target?.uuid)
    const attack = await CombatCard.chooseAttack(opponent, { victim: system.actor })
    if (!attack) return
    // Les joueurs lancent les dés : le dé de dégâts d'une attaque est lancé par le joueur depuis la carte
    if (attack.system.hasDamageDice) {
      await CombatCard.updateCard(message, { combat: COMBAT_STATUS.AWAITING_OPPONENT_DICE, opponentAttack: CombatCard.getAttackInfo(attack) })
      return
    }
    await CombatCard.updateCard(message, ...(await CombatCard.fixedDamage(attack, system.actor)))
  }

  /**
   * Roll the damage dice of the opponent's attack, by the player of the character who takes it (or the GM).
   * @param {ChatMessage} message The combat card.
   * @returns {Promise<void>}
   */
  static async rollOpponentDice(message) {
    const system = message.system
    if (!system.canRollOpponentDice()) return
    const roll = await new Roll(system.opponentAttack.formula).evaluate()
    const damage = CtHackRoll.computeDamage(roll, { side: "opponent", source: system.opponentAttack.name, target: system.actor })
    await CombatCard.updateCard(message, { combat: COMBAT_STATUS.RESOLVED, damage }, roll)
  }

  /**
   * The damage of an attack without damage dice : a constant roll, displayed as the other damage rolls.
   * @param {Item} attack The attack of the opponent.
   * @param {Object} victim The participant who takes the damage.
   * @returns {Promise<[Object, Roll]>} The card changes and the roll.
   */
  static async fixedDamage(attack, victim) {
    const roll = await new Roll(attack.system.damageFormula).evaluate()
    const damage = CtHackRoll.computeDamage(roll, { side: "opponent", source: attack.name, target: victim })
    return [{ combat: COMBAT_STATUS.RESOLVED, damage }, roll]
  }

  /**
   * The attack data stored in a card.
   * @param {Item} attack The attack of the opponent.
   * @returns {{id: string, name: string, formula: string}}
   */
  static getAttackInfo(attack) {
    return { id: attack.id, name: attack.name, formula: attack.system.damageFormula }
  }

  /**
   * The card changes after the save of a character defending against an opponent's attack :
   * nothing on a success, else the Hit Dice roll, the damage dice to roll by the player, or the fixed damage at once.
   * @param {string} resultType The result of the save : success or failure.
   * @param {Item} attack The attack of the opponent.
   * @param {Object} victim The defending character.
   * @returns {Promise<{system: Object, roll: Roll|undefined}>} The card data and the fixed damage roll, if any.
   */
  static async resolveDefense(resultType, attack, victim) {
    const system = { defense: true, opponentAttack: CombatCard.getAttackInfo(attack) }
    if (resultType === "success") return { system: { ...system, combat: COMBAT_STATUS.NO_DAMAGE } }
    // Santé en Dés de vie : le personnage fait directement son jet de Dé de vie
    if (game.settings.get("cthack", "HealthDisplay") === "hd") return { system: { ...system, combat: COMBAT_STATUS.AWAITING_HIT_DICE } }
    if (attack.system.hasDamageDice) return { system: { ...system, combat: COMBAT_STATUS.AWAITING_OPPONENT_DICE } }
    const [changes, roll] = await CombatCard.fixedDamage(attack, victim)
    return { system: { ...system, ...changes }, roll }
  }

  /**
   * The GM uses an attack of an opponent against the targeted character : the attack is used for the round,
   * and the players of the character are asked to roll the save chosen by the GM to avoid it.
   * @param {Actor} opponent The opponent.
   * @param {Item} attack The attack of the opponent.
   * @returns {Promise<ChatMessage|null>} The request message.
   */
  static async requestDefense(opponent, attack) {
    if (!game.user.isGM || !attack?.system.hasDamage) return null
    const character = game.user.targets.first()?.actor
    if (character?.type !== "character") {
      ui.notifications.warn(game.i18n.localize("CTHACK.Defense.noTarget"))
      return null
    }
    // Le token de l'Opposant : celui de la fiche, sinon un token contrôlé, sinon le premier de la scène (tokens non liés compris)
    const tokenDocument = opponent.token ?? canvas.tokens?.controlled.find((t) => t.actor?.id === opponent.id)?.document ?? opponent.getActiveTokens(false, true)[0]
    if (!tokenDocument) {
      ui.notifications.warn(game.i18n.format("CTHACK.Defense.noToken", { name: opponent.name }))
      return null
    }
    opponent = tokenDocument.actor
    const opponentInfo = CthackUtils.getActorInfo(opponent, tokenDocument)
    const victim = CthackUtils.getActorInfo(character, game.user.targets.first().document)
    const attackInfo = { ...CombatCard.getAttackInfo(attack), img: attack.img, isFixed: !attack.system.hasDamageDice }
    const choice = await CombatCard.chooseDefense({ opponent: opponentInfo, victim, attack: attackInfo })
    if (!choice) return null

    await CtHackCombat.useOpponentAction(opponent)

    const players = game.users.filter((u) => !u.isGM && character.testUserPermission(u, "OWNER"))
    for (const player of players) game.socket.emit(`system.${SYSTEM.id}`, { msg: "askRoll", data: { userId: player.id } })
    const saveLabel = game.i18n.localize(SYSTEM.SAVES[choice.save].label)
    const advantageLabel = choice.avantage !== "=" ? game.i18n.localize(`CTHACK.Defense.advantage.${choice.avantage}`) : ""
    return ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: opponent }),
      content: await foundry.applications.handlebars.renderTemplate("systems/cthack/templates/chat/ask-defense.hbs", {
        opponent: opponentInfo,
        victim,
        attack: attackInfo,
        save: choice.save,
        avantage: choice.avantage,
        saveText: advantageLabel ? `${saveLabel} (${advantageLabel})` : saveLabel,
      }),
      whisper: [game.user.id, ...players.map((u) => u.id)],
      flags: { cthack: { typeMessage: "askDefense" } },
    })
  }

  /**
   * Ask the GM which save the character makes to defend against the attack, with which advantage.
   * @param {Object} context The opponent, the victim and the attack.
   * @returns {Promise<{save: string, avantage: string}|null>} The choice, or null if the dialog is closed.
   */
  static async chooseDefense(context) {
    const saves = ["dex", "str"].map((id, index) => ({ id, label: game.i18n.localize(SYSTEM.SAVES[id].label), checked: index === 0 }))
    const content = await foundry.applications.handlebars.renderTemplate("systems/cthack/templates/dialog/request-defense.hbs", {
      ...context,
      saves,
      avantages: 3,
      selectAvantages: CtHackRoll._convertAvantages(3),
    })
    return foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.localize("CTHACK.Defense.title"), icon: "fa-solid fa-shield-halved" },
      classes: ["cthack", "cthack-choose-attack"],
      position: { width: 420 },
      content,
      buttons: [
        {
          action: "request",
          label: game.i18n.localize("CTHACK.Defense.send"),
          icon: "fa-solid fa-dice-d20",
          default: true,
          callback: (event, button) => ({
            save: button.form.elements.save.value,
            avantage: CombatCard.ADVANTAGES[parseInt(button.form.elements.avantages.value, 10) - 1],
          }),
        },
      ],
      // Libellé de la glissière mis à jour en direct, comme dans la fenêtre de jet
      render: (event, dialog) => {
        const range = dialog.element.querySelector('input[name="avantages"]')
        const label = dialog.element.querySelector('input[name="selectAvantages"]')
        range.addEventListener("input", () => (label.value = CtHackRoll._convertAvantages(parseInt(range.value, 10))))
      },
      rejectClose: false,
    })
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
          label: game.i18n.localize("CTHACK.Card.chooseAttack"),
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
   * by a user who can roll the character's damage, the damage dice of the opponent's attack or the Hit Dice of the wounded character (the only actions of a player on a card).
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
    if (!message.system.canRollPlayerDamage(user) && !message.system.canRollOpponentDice(user) && !message.system.canRollHitDice(user)) return false
    const { system, rolls } = updateData
    await message.update(rolls ? { system, rolls } : { system })
    return true
  }
}
