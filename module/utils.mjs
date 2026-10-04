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
    }
  }

  /**
   * Describe the participant of a roll card : an actor and, if possible, its token.
   * @param {Actor} actor The actor.
   * @param {TokenDocument} [tokenDocument] The token of the actor, if known.
   * @returns {{uuid: string, tokenUuid: string, name: string, img: string, type: string}}
   */
  static getActorInfo(actor, tokenDocument) {
    tokenDocument ??= actor.token ?? actor.getActiveTokens(true, true)[0]
    return {
      uuid: actor.uuid,
      tokenUuid: tokenDocument?.uuid ?? "",
      name: tokenDocument?.name ?? actor.name,
      img: tokenDocument?.texture.src ?? actor.prototypeToken?.texture.src ?? actor.img,
      type: actor.type,
    }
  }

  /**
   * Describe the target of a roll : the token, its image, and for an opponent its armor and malus.
   * @param {Token} [token] The targeted token.
   * @returns {Object|null} The target data stored in the card, or null without a target.
   */
  static getTargetInfo(token) {
    const actor = token?.actor
    if (!actor) return null
    const isOpponent = actor.type === "opponent"
    return {
      ...CthackUtils.getActorInfo(actor, token.document),
      armor: isOpponent ? actor.system.armor : null,
      malus: isOpponent ? actor.system.malus : null,
    }
  }

  /**
   * The attacks of an opponent which deal damage.
   * @param {Actor} opponent The opponent.
   * @returns {Item[]}
   */
  static getDamagingAttacks(opponent) {
    if (opponent?.type !== "opponent") return []
    return opponent.itemTypes.attack.filter((a) => a.system.hasDamage)
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
