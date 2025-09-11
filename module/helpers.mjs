import { isDice, isAbilityKeyReserved } from './utils.mjs';
import { CTHACK } from './config.mjs';

import { SAVES } from './config/character.mjs';

export const registerHandlebarsHelpers = function() {

	Handlebars.registerHelper('hasModifier', function(modifier) {
		return modifier !== null && modifier !== 0;
	});

	Handlebars.registerHelper('isModifierPositive', function(modifier) {
		return modifier > 0;
	});

	Handlebars.registerHelper('isModifierNegative', function(modifier) {
		return modifier !== null && modifier < 0;
	});

	Handlebars.registerHelper('getSaveLabel', function(key, save) {
		let label = game.i18n.localize(SAVES[key].label);
		if (save.advantage) label = label.concat(' *');
		return label;
	});

	Handlebars.registerHelper('toDesc', function(save) {
		return SAVES[save].description;
	});

	Handlebars.registerHelper('stringNeitherNullEmpty', function(str) {
		return str !== null && str !== '';
	});

	Handlebars.registerHelper('isEnabled', function(configKey) {
		const value = game.settings.get("cthack", configKey);
		if (value === false || value === "none" || value === "") return false;
        return true;

	});

	Handlebars.registerHelper('getFortuneValue', function() {
		return game.settings.get('cthack', 'FortuneValue');
	});

	Handlebars.registerHelper('getMiscellaneousValue', function() {
		return game.settings.get('cthack', 'MiscellaneousResource');
	});

	Handlebars.registerHelper('getAdrenalineImage', function(value) {
		if (value === 'pj') {
			return 'systems/cthack/ui/dmk_jeton_fortune_on.webp';
		} else return 'systems/cthack/ui/dmk_jeton_fortune_off.webp';
	});

	Handlebars.registerHelper('rangeDesc', function(str) {
		return game.i18n.localize(game.system.CONST.RANGE[str].label);
	});

	Handlebars.registerHelper('isDiceRollable', function(dice) {
		return dice !== "" && dice !== "0" && dice !== "1";
	});

	Handlebars.registerHelper('timeSince', function(timeStamp) {
		timeStamp = new Date(timeStamp);
		let now = new Date(),
			secondsPast = (now - timeStamp) / 1000,
			since = '';

		// Format the time
		if (secondsPast < 60) {
			since = parseInt(secondsPast);
			if (since <= 0) return 'Now';
			else since = since + 's';
		} else if (secondsPast < 3600) since = parseInt(secondsPast / 60) + 'm';
		else if (secondsPast <= 86400) since = parseInt(secondsPast / 3600) + 'h';
		else {
			let hours = parseInt(secondsPast / 3600),
				days = parseInt(hours / 24);
			since = `${days}d ${hours % 24}h`;
		}

		// Return the string
		return since + ' ago';
	});

	Handlebars.registerHelper('abilityPeriodToString', function(str) {
		const period = CTHACK.abilityUsePeriod[str];
		return game.i18n.localize(period);
	});

	Handlebars.registerHelper('magicTypeToString', function(str) {
		const period = CTHACK.magicType[str];
		return game.i18n.localize(period);
	});

	Handlebars.registerHelper('isAbilityKeyReadOnly', function(key) {
		if (isAbilityKeyReserved(key)) {
			return true;
		}
		return false;
	});

	Handlebars.registerHelper('getStyleForDice', function(value) {
		if (value === undefined) return;
		if (value === "" || value == 0 || value == 1) return `style="color:white;"`;
		return `style="background-image:url('systems/cthack/ui/dice/${value}.webp');padding: 5px;"`;
	});

	Handlebars.registerHelper('getDiceImg', function(value) {
		if (value === undefined) return;
		if (value === "" || value == 0 || value == 1) return ;
		return `src="systems/cthack/ui/dice/${value}.webp"`;
	});

	Handlebars.registerHelper('getNbRessources', function() {
		const wealthEnabled = game.settings.get("cthack","Wealth") !== "none" ? true : false;
		const miscellaneousEnabled = game.settings.get("cthack","MiscellaneousResource") !== "" ? true : false;
        if (wealthEnabled && miscellaneousEnabled) return "resources-5";
		if (wealthEnabled || miscellaneousEnabled) return "resources-4";
		return "resources-3";
	});

	Handlebars.registerHelper('getNbFightColumns', function() {
		const healthDisplay = game.settings.get("cthack","HealthDisplay");
		
		if (healthDisplay === "both") return "fight-4";
		return "fight-3";
	});

	Handlebars.registerHelper('getRangeLabel', function(value) {
		if (value === "---" || value === "") return ""
		return game.i18n.localize(SYSTEM.RANGE[value].label);
	});

};
