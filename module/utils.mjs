import { ARRAY_DICE_VALUES, ABILITY_KEYS_RESERVED } from "./config.mjs"
import { CTHACK } from "./config.mjs"
import { LOG_HEAD } from "./constants.mjs"

/**
 * Check the value is a valid dice (dX)
 * @param event the roll event
 */
export function isDice(value) {
  return DICE_VALUES.includes(value)
}

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
    }
  }

  static _handleMsgUseFortune(data) {
    game.settings.set("cthack", "FortuneValue", data.value)
  }

  static _handleMsgAskRoll(data) {
    const currentUser = game.user._id
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
