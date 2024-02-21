import * as ABILITY from "./ability.mjs";
import * as CHARACTER from "./character.mjs";

export const SYSTEM_ID = "cthack";

export const DICES_DAMAGE = { 0: "0", 1: "1", d4: "4", d6: "6", d8: "8", d10: "10", d12: "12" };

export const WEALTH_START = { 2: "CHA*2", 3: "CHA*3", 4: "CHA*4", sp: "CTHACK.WealthStartSpecial"};

/**
 * Include all constant definitions within the SYSTEM global export
 * @type {Object}
 */
export const SYSTEM = {
  id: SYSTEM_ID,
  ABILITY_USAGE: ABILITY.USE,
  DICES_DAMAGE,
  WEALTH_START,
  SAVES: CHARACTER.SAVES
};
