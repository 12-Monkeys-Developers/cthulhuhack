import * as CHARACTER from "./character.mjs";
import * as OPPONENT from "./opponent.mjs";
import * as ABILITY from "./ability.mjs";
import * as MAGIC from "./magic.mjs";
import * as ATTACK from "./attack.mjs";

export const SYSTEM_ID = "cthack";

export const DICES_DAMAGE = { 0: "0", 1: "1", d4: "4", d6: "6", d8: "8", d10: "10", d12: "12" };
export const DICES_VALUE = { 0: "0", d4: "4", d6: "6", d8: "8", d10: "10", d12: "12" };
export const DICES_MAX = { 0: "0", d4: "4", d6: "6", d8: "8", d10: "10", d12: "12" };

export const WEALTH_START = { 2: "CHA*2", 3: "CHA*3", 4: "CHA*4", sp: "CTHACK.WealthStartSpecial" };

/**
 * Include all constant definitions within the SYSTEM global export
 * @type {Object}
 */
export const SYSTEM = {
  id: SYSTEM_ID,
  ABILITY_USAGE: ABILITY.USE,
  DICES_DAMAGE,
  DICES_VALUE,
  DICES_MAX,
  WEALTH_START,
  SAVES: CHARACTER.SAVES,
  RESOURCES: CHARACTER.RESOURCES,
  DAMAGES: CHARACTER.DAMAGES,
  ADRENALINE: CHARACTER.ADRENALINE,
  MAGIC_TYPE: MAGIC.MAGIC_TYPE,
  OPPONENT_HIT_DICE: OPPONENT.HIT_DICE,
  ATTACK_DAMAGE_DICE: ATTACK.DAMAGE_DICE
};
