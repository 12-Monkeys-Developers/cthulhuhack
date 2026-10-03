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
      case "chooseOpponentAttack":
        return CthackUtils._handleMsgChooseOpponentAttack(sockmsg.data)
      case "chooseOpponentAttackResult":
        return CthackUtils._handleMsgChooseOpponentAttackResult(sockmsg.data)
    }
  }

  /** Resolvers of the pending attack choices, by request id. */
  static _pendingAttackChoices = new Map()

  /**
   * Ask the GM to choose which attack an opponent uses.
   * @param {string} actorUuid The uuid of the opponent.
   * @param {string[]} attackIds The ids of the possible attacks.
   * @returns {Promise<string|null>} The chosen attack id, or null if no choice was made (no active GM, closed dialog).
   */
  static async chooseOpponentAttack(actorUuid, attackIds) {
    if (game.user.isGM) return CthackUtils._promptOpponentAttack(await fromUuid(actorUuid), attackIds)
    const gm = game.users.activeGM
    if (!gm) return null
    const requestId = foundry.utils.randomID()
    return new Promise((resolve) => {
      CthackUtils._pendingAttackChoices.set(requestId, resolve)
      game.socket.emit("system.cthack", { msg: "chooseOpponentAttack", data: { requestId, gmId: gm.id, actorUuid, attackIds } })
    })
  }

  static async _promptOpponentAttack(opponent, attackIds) {
    const attacks = attackIds.map((id) => opponent?.items.get(id)).filter(Boolean)
    const attackId = await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.localize("CTHACK.Dialog.chooseOpponentAttack") },
      buttons: attacks.map((a) => ({ action: a.id, label: `${a.name} (${a.system.damageDice})` })),
      rejectClose: false,
    })
    return attackId ?? null
  }

  static async _handleMsgChooseOpponentAttack(data) {
    if (data.gmId !== game.user.id) return
    const opponent = await fromUuid(data.actorUuid)
    const attackId = await CthackUtils._promptOpponentAttack(opponent, data.attackIds)
    game.socket.emit("system.cthack", { msg: "chooseOpponentAttackResult", data: { requestId: data.requestId, attackId } })
  }

  static _handleMsgChooseOpponentAttackResult(data) {
    const resolve = CthackUtils._pendingAttackChoices.get(data.requestId)
    if (!resolve) return
    CthackUtils._pendingAttackChoices.delete(data.requestId)
    resolve(data.attackId)
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
