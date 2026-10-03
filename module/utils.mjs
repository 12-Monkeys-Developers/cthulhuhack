import { ARRAY_DICE_VALUES, ABILITY_KEYS_RESERVED } from "./config.mjs"
import { CTHACK } from "./config.mjs"
import { LOG_HEAD } from "./constants.mjs"

/**
 * Format a date to a string
 * @param {Date} dt
 */
export function formatDate(dt) {
  // ensure date comes as 01, 09 etc
  const DD = ("0" + dt.getDate()).slice(-2)

  // getMonth returns month from 0
  const MM = ("0" + (dt.getMonth() + 1)).slice(-2)
  const YYYY = dt.getFullYear()
  const hh = ("0" + dt.getHours()).slice(-2)
  const mm = ("0" + dt.getMinutes()).slice(-2)

  // will output something like "14/02/2019 11:04"
  const date_string = `${DD}/${MM}/${YYYY} ${hh}:${mm}`

  return date_string
}

/**
 * Check if the key of the ability is reserved by the standard abilities
 * @param {String} key
 */
export function isAbilityKeyReserved(key) {
  return ABILITY_KEYS_RESERVED.includes(key)
}

export class CthackUtils {
  static performSocketMesssage(sockmsg) {
    if (CTHACK.debug) console.log(LOG_HEAD + ">>>>> MSG RECV", sockmsg)
    switch (sockmsg.msg) {
      case "msg_use_fortune":
        return CthackUtils._handleMsgUseFortune(sockmsg.data)
      case "askRoll":
        return CthackUtils._handleMsgAskRoll(sockmsg.data)
      case "rollOpponentAttack":
        return CthackUtils._handleMsgRollOpponentAttack(sockmsg.data)
    }
  }

  /**
   * Have an opponent attack, on the GM side: the GM chooses the attack if there are several, then rolls its damage.
   * A player's client relays the request to the active GM.
   * @param {string} actorUuid The uuid of the opponent.
   * @param {string[]} attackIds The ids of the possible attacks.
   * @returns {Promise<void>}
   */
  static async rollOpponentAttack(actorUuid, attackIds) {
    if (!game.user.isGM) {
      const gm = game.users.activeGM
      if (!gm) return
      game.socket.emit("system.cthack", { msg: "rollOpponentAttack", data: { gmId: gm.id, actorUuid, attackIds } })
      return
    }
    const opponent = await fromUuid(actorUuid)
    const attacks = attackIds.map((id) => opponent?.items.get(id)).filter(Boolean)
    let attack = attacks[0]
    if (attacks.length > 1) {
      const attackId = await foundry.applications.api.DialogV2.wait({
        window: { title: game.i18n.localize("CTHACK.Dialog.chooseOpponentAttack") },
        buttons: attacks.map((a) => ({ action: a.id, label: `${a.name} (${a.system.hasDamageDice ? a.system.damageDice : a.system.damage})` })),
        rejectClose: false,
      })
      attack = attacks.find((a) => a.id === attackId)
    }
    if (!attack) return
    if (attack.system.hasDamageDice) return opponent.system.rollAttack(attack.system.damageDice, attack.name)
    // Dégâts fixes sans dé : pas de jet, la valeur est simplement annoncée dans le chat
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: opponent }),
      content: `${attack.name} : ${attack.system.damage} (${game.i18n.localize("CTHACK.Damage")})`,
    })
  }

  static async _handleMsgRollOpponentAttack(data) {
    if (data.gmId !== game.user.id) return
    await CthackUtils.rollOpponentAttack(data.actorUuid, data.attackIds)
  }

  static _handleMsgUseFortune(data) {
    game.settings.set("cthack", "FortuneValue", data.value)
  }

  static _handleMsgAskRoll(data) {
    const currentUser = game.user.id
    if (data.userId === currentUser) {
      foundry.audio.AudioHelper.play({ src: "/systems/cthack/sounds/drums.wav", volume: 0.8, autoplay: true, loop: false }, false)
    }
  }

  // Used when a ressource is lost to find the next lower dice
  static findLowerDice(dice) {
    let index = ARRAY_DICE_VALUES.indexOf(dice)
    return ARRAY_DICE_VALUES[index - 1]
  }
}
