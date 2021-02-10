import { DICE_VALUES, ABILITY_KEYS_RESERVED } from './config.js';

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
	if (CONFIG.debug.cthack) console.log(`Find lower dice of ${dice}`);
	let result = '0';
	if (dice !== '0') {
		let value = parseInt(dice.substring(1));
		let index = DICE_VALUES.indexOf(value);
		let newValue = DICE_VALUES[index - 1];
		if (newValue !== 0) {
			result = 'd' + newValue;
		}
	}
	if (CONFIG.debug.cthack) console.log(`Lower dice is ${result}`);
	return result;
}

/**
 * Format a date to a string
 * @param {Date} dt 
 */
export function formatDate(dt) {
	// ensure date comes as 01, 09 etc
	const DD = ('0' + dt.getDate()).slice(-2);

	// getMonth returns month from 0
	const MM = ('0' + (dt.getMonth() + 1)).slice(-2);

	const YYYY = dt.getFullYear();

	const hh = ('0' + dt.getHours()).slice(-2);

	const mm = ('0' + dt.getMinutes()).slice(-2);

	const ss = ('0' + dt.getSeconds()).slice(-2);

	// will output something like "14/02/2019 11:04:42"
	const date_string = `${DD}/${MM}/${YYYY} ${hh}:${mm}:${ss}`;

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
		if (CONFIG.debug.cthack) console.log('>>>>> MSG RECV', sockmsg);
		switch (sockmsg.msg) {
			case 'msg_use_fortune':
				return CthackUtils._handleMsgUseFortune(sockmsg.data);
		}
	}

	static _handleMsgUseFortune(data) {		
		game.settings.set('cthack', 'FortuneValue', data.value);
	}
}

export function refreshAllActorSheets(){
	console.log("Refreshing all ActorSheets");
	Object.values(ui.windows)
    .filter(w => w.constructor.name === "CtHackActorSheet")
    .forEach(w => w.render(false));
}