import { DICE_VALUES, ABILITY_KEYS_RESERVED } from "./config.js";
import { CTHACK } from "./config.js";
import { LOG_HEAD } from "./constants.js";

/**
 * Check the value is a valid dice (dX)
 * @param event the roll event
 */
export function isDice(value) {
  return DICE_VALUES.includes(value);
}

/**
 * Return the next lower type of dice : d4 for d6 by exemple
 * @param dice the current dice dX
 */
export function findLowerDice(dice) {
  if (CTHACK.debug) console.log(`${LOG_HEAD}Find lower dice of ${dice}`);
  let result = "0";
  if (dice !== "0") {
    let value = parseInt(dice.substring(1));
    let index = DICE_VALUES.indexOf(value);
    let newValue = DICE_VALUES[index - 1];
    if (newValue !== 0) {
      result = "d" + newValue;
    }
  }
  if (CTHACK.debug) console.log(`${LOG_HEAD}Lower dice is ${result}`);
  return result;
}

/**
 * Format a date to a string
 * @param {Date} dt
 */
export function formatDate(dt) {
  // ensure date comes as 01, 09 etc
  const DD = ("0" + dt.getDate()).slice(-2);

  // getMonth returns month from 0
  const MM = ("0" + (dt.getMonth() + 1)).slice(-2);
  const YYYY = dt.getFullYear();
  const hh = ("0" + dt.getHours()).slice(-2);
  const mm = ("0" + dt.getMinutes()).slice(-2);

  // will output something like "14/02/2019 11:04"
  const date_string = `${DD}/${MM}/${YYYY} ${hh}:${mm}`;

  return date_string;
}

/**
 * Check if the key of the ability is reserved by the standard abilities
 * @param {String} key
 */
export function isAbilityKeyReserved(key) {
  return ABILITY_KEYS_RESERVED.includes(key);
}

export class CthackUtils {
  static performSocketMesssage(sockmsg) {
    if (CTHACK.debug) console.log(LOG_HEAD + ">>>>> MSG RECV", sockmsg);
    switch (sockmsg.msg) {
      case "msg_use_fortune":
        return CthackUtils._handleMsgUseFortune(sockmsg.data);
      case "msg_ask_roll":
        return CthackUtils._handleMsgAskRoll(sockmsg.data);
    }
  }

  static _handleMsgUseFortune(data) {
    game.settings.set("cthack", "FortuneValue", data.value);
  }

  static _handleMsgAskRoll(data) {
    const currentUser = game.user._id;
    if (data.userId === currentUser) {
      AudioHelper.play({ src: "/systems/cthack/sounds/drums.wav", volume: 0.8, autoplay: true, loop: false }, false);
    }
  }
}

