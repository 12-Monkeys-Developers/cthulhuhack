/**
 * A standardized helper function for managing Cthulhu Hack dice rolls
 *
 * @param {String} diceType             The type of dice : d20, d12, d10, d8, d6, d4
 * @param {String} customFormula        Custom Formula
 * @param {Array} parts                 The dice roll component parts, excluding the initial dice
 * @param {Object} data                 Actor or item data against which to parse the roll
 * @param {Event|object} event          The triggering event which initiated the roll
 * @param {string} rollMode             A specific roll mode to apply as the default for the resulting roll
 * @param {string|null} template        The HTML template used to render the roll dialog
 * @param {string|null} title           The dice roll UI window title
 * @param {Object} speaker              The ChatMessage speaker to pass when creating the chat
 * @param {Function} onClose            Callback for actions to take when the dialog form is closed
 * @param {Object} dialogOptions        Modal dialog options
 * @param {boolean} advantage           Apply advantage to the roll (unless otherwise specified)
 * @param {boolean} disadvantage        Apply disadvantage to the roll (unless otherwise specified)
 * @param {boolean} rollType            Specify the type of roll : Save, Resource, Damage, Material, AttackDamage
 * @param {boolean} rollId            	
 * @param {number} targetValue          Assign a target value against which the result of this roll should be compared
 * @param {boolean} chatMessage         Automatically create a Chat Message for the result of this roll
 * @param {number} modifier             Bonus (+X) or malus (-X) for the roll
 * @param {object} messageData          Additional data which is applied to the created Chat Message, if any
 * @param {object} abilitiesAdvantages  Advantages gained from abilities
 *
 * @return {Promise}                    A Promise which resolves once the roll workflow has completed
 */
export async function diceRoll(
	{
		diceType = 'd20',
		customFormula = null,
		parts = [],
		data = {},
		event = {},
		rollMode = null,
		template = null,
		title = null,
		speaker = null,
		dialogOptions,
		advantage = null,
		disadvantage = null,
		rollType = null,
		rollId = null,
		targetValue = null,
		chatMessage = true,
		modifier = null,
		abilitiesAdvantages = null,
		messageData = {}
	} = {}
) {
	// Prepare Message Data
	messageData.speaker = speaker || ChatMessage.getSpeaker();
	let messageOptions = { rollMode: rollMode || game.settings.get('core', 'rollMode') };

	// adv is the choice on the Dialog Roll : from -2 to +2
	let adv = 0;

	// Define the inner roll function
	const _roll = (parts, adv, form, advantage, disadvantage) => {
		// Determine the dice roll and modifiers
		let nd;
		let mods = '';

		nd = _calculateNumberOfDices(adv, advantage, disadvantage);

		if (rollType === 'Save') {
			if (nd === 1) mods += 'kl';
			else {
				if (adv === 1 || adv == 2) {
					mods += 'kl';
				} else {
					mods += 'kh';
				}
			}
		} else {
			if (nd === 1) mods += 'kh';
			else {
				if (adv === 1 || adv == 2) {
					mods += 'kh';
				} else {
					mods += 'kl';
				}
			}
		}

		// Prepend the dice roll
		let formula = `${nd}${diceType}${mods}`;

		if (customFormula !== null) {
			parts.unshift(customFormula);
		} else {
			parts.unshift(formula);
		}

		// Optionally include a situational bonus
		if (rollType === 'Save' && form) {
			data['modifier'] = Math.abs(form.modifier.value);
			modifier = form.modifier.value;
			messageOptions.rollMode = form.rollMode.value;
		}

		// Execute the roll
		let roll = new Roll(parts.join(' + '), data);

		try {
			roll.evaluate({async: false});
		} catch (err) {
			console.error(err);
			//ui.notifications.error(`Dice roll evaluation failed: ${err.message}`);
			return null;
		}

		// Flag options for all dices of a roll
		for (let d of roll.dice) {
			if (adv === 1) d.options.advantage = true;
			else if (adv === -1) d.options.disadvantage = true;
			else if (adv === 2) d.options.doubleadvantage = true;
			else if (adv === -2) d.options.doubledisadvantage = true;
			if (targetValue) d.options.target = targetValue;
			if (modifier) d.options.modifier = modifier;

			if (advantage) d.options.advantageFromCondition = true;
			if (disadvantage) d.options.disadvantageFromCondition = true;

			d.options.rollType = rollType;
		}

		return roll;
	};

	// Create the Roll instance
	const roll = await _diceRollDialog({
		template,
		title,
		parts,
		data,
		rollMode: messageOptions.rollMode,
		dialogOptions,
		rollType,
		rollId,
		modifier,
		advantage,
		disadvantage,
		abilitiesAdvantages,
		roll: _roll
	});

	// Create a Chat Message
	if (roll && chatMessage) {
		// Get the display name of the roll
		roll.rollId = rollId;

		if (advantage) {
			roll.advantage = true;
		}
		if (disadvantage) {
			roll.disadvantage = true;
		}

		for (let d of roll.dice) {
			if (d.options.advantage) {
				roll.advantageFromDialog = true;
			}
			if (d.options.disadvantage) {
				roll.disadvantageFromDialog = true;
			}
			if (d.options.doubleadvantage) {
				roll.doubleAdvantageFromDialog = true;
			}
			if (d.options.doubledisadvantage) {
				roll.doubleDisadvantageFromDialog = true;
			}
		}

		// Define which template to use for the different rollType (Save, Resource, Material, Damage, AttackDamage)
		if (rollType === 'Save' && targetValue) {
			let hasModifier = false;
			if (modifier !== null && modifier != '') {
				roll.modifier = modifier;
				hasModifier = true;
			}

			if (roll.total < (hasModifier ? targetValue + parseFloat(modifier) : targetValue)) {
				roll.isSuccess = true;
			} else {
				roll.isSuccess = false;
			}

			roll.realTargetValue = hasModifier ? targetValue + parseFloat(modifier) : targetValue;
			messageData.content = await renderTemplate(`systems/cthack/templates/chat/roll-save.hbs`, roll);
		}

		if (rollType === 'Resource' || rollType === 'Material') {
			// Resource roll
			if (roll.total == 1 || roll.total == 2) {
				roll.resourceLost = true;
				roll.isSuccess = false;
			} else roll.resourceLost = false;

			messageData.content = await renderTemplate(`systems/cthack/templates/chat/roll-resource.hbs`, roll);
		}

		if (rollType === 'Damage') {
			messageData.content = await renderTemplate(`systems/cthack/templates/chat/roll-other.hbs`, roll);
		}

		if (rollType === 'AttackDamage') {
			messageData.content = await renderTemplate(`systems/cthack/templates/chat/roll-other.hbs`, roll);
		}

		roll.toMessage(messageData, messageOptions);
	}

	return roll;
}

/**
 * @name _calculateNumberOfDices
 * 
 * @description	Calculate the number of idices to roll depending of advantages and disadvantages
 *
 * @private
 * 
 * @param (Int)		dialogChoice From -2 (Double disadvantage) to +2 (Double advantage) chosen on the roll dialog
 * @param (Boolean)	advantage		true if there is an advantage given by a capacity or condition
 * @param (Boolean)	disadvantage	false if there is a disadvantage given by a capacity or condition
 * 
 * @returns (Int) the number of dices to roll
 */
function _calculateNumberOfDices(dialogChoice, advantage, disadvantage) {
	let numberofDices;

	// Handle normal choice
	if (dialogChoice === 0) {
		numberofDices = 1;
		// Custom advantage or disadvantage
		if (advantage && disadvantage) {
			return numberofDices;
		}
		if (advantage || disadvantage) {
			numberofDices++;
		}
		return numberofDices;
	}

	// Handle double advantage choice
	if (dialogChoice === 2) {
		numberofDices = 3;
		// Custom advantage or disadvantage
		if (advantage) {
			numberofDices++;
		}
		if (disadvantage) {
			numberofDices--;
		}
	} else if (dialogChoice === 1) {
		// Handle advantage choice
		numberofDices = 2;
		// Custom advantage or disadvantage
		if (advantage) {
			numberofDices++;
		}
		if (disadvantage) {
			numberofDices--;
		}
	} else if (dialogChoice === -1) {
		// Handle disadvantage choice
		numberofDices = 2;
		// Custom advantage or disadvantage
		if (advantage) {
			numberofDices--;
		}
		if (disadvantage) {
			numberofDices++;
		}
	} else if (dialogChoice === -2) {
		// Handle double disadvantage choice
		numberofDices = 3;
		// Custom advantage or disadvantage
		if (advantage) {
			numberofDices--;
		}
		if (disadvantage) {
			numberofDices++;
		}
	}
	return numberofDices;
}

/**
 * Present a Dialog form which creates a roll once submitted
 * @returns {Promise<Roll>}
 * @private
 */
async function _diceRollDialog({ template, title, parts, data, rollMode, dialogOptions, rollType, modifier, advantage, disadvantage, abilitiesAdvantages, roll } = {}) {
	// Render modal dialog
	template = template || 'systems/cthack/templates/dialog/roll-dialog.hbs';
	let dialogData = {
		formula: parts.join(' + '),
		data: data,
		rollMode: rollMode,
		rollModes: CONFIG.Dice.rollModes,
		rollType: rollType,
		modifier: modifier,
		advantage: advantage,
		disadvantage: disadvantage,
		abilitiesAdvantages: abilitiesAdvantages
	};
	const html = await renderTemplate(template, dialogData);

	let dialogFinalOptions = dialogOptions !== undefined ? foundry.utils.mergeObject(dialogOptions, {classes: ["dialog", "cthack", "dialog-roll"]}) : {classes: ["cthack", "dialog-roll"]};

	// TODO Virer les tooltips et utiliser le fonctionnement standard de Foundry
	if (rollType !== 'Damage' && rollType !== 'AttackDamage') {
		// Create the Dialog window
		return new Promise((resolve) => {
			new Dialog(
				{
					title: title,
					content: html,
					buttons: {
						doubleDisadvantageBtn: {
							icon: `<div data-tooltip="${game.i18n.localize('CTHACK.DoubleDisadvantage')}"><i class="fas fa-minus"></i> <i class="fas fa-minus"></i>`,
							callback: (html) => resolve(roll(parts, -2, html[0].querySelector('form'), advantage, disadvantage))
						},
						disadvantageBtn: {
							icon: `<div data-tooltip="${game.i18n.localize('CTHACK.Disadvantage')}"><i class="fas fa-minus"></i>`,
							callback: (html) => resolve(roll(parts, -1, html[0].querySelector('form'), advantage, disadvantage))
						},
						normalBtn: {
							icon: `<div data-tooltip="${game.i18n.localize('CTHACK.Normal')}"><i class="fas fa-check"></i>`,
							callback: (html) => resolve(roll(parts, 0, html[0].querySelector('form'), advantage, disadvantage))
						},
						advantageBtn: {
							icon: `<div data-tooltip="${game.i18n.localize('CTHACK.Advantage')}"><i class="fas fa-plus"></i>`,
							callback: (html) => resolve(roll(parts, 1, html[0].querySelector('form'), advantage, disadvantage))
						},
						doubleAdvantageBtn: {
							icon: `<div data-tooltip="${game.i18n.localize('CTHACK.DoubleAdvantage')}"><i class="fas fa-plus"></i> <i class="fas fa-plus"></i>`,
							callback: (html) => resolve(roll(parts, 2, html[0].querySelector('form'), advantage, disadvantage))
						}
					},
					default: 'normalBtn',
					close: () => resolve(null)
				},
				dialogFinalOptions
			).render(true);
		});
	} else if (rollType === 'Damage') {
		// Create the Dialog window
		return new Promise((resolve) => {
			new Dialog(
				{
					title: title,
					content: html,
					buttons: {
						disadvantageBtn: {
							icon: `<div data-tooltip="${game.i18n.localize('CTHACK.Disadvantage')}"><i class="fas fa-minus"></i>`,
							callback: (html) => resolve(roll(parts, -1, html[0].querySelector('form'), advantage, disadvantage))
						},
						normalBtn: {
							icon: `<div data-tooltip="${game.i18n.localize('CTHACK.Normal')}"><i class="fas fa-check"></i>`,
							callback: (html) => resolve(roll(parts, 0, html[0].querySelector('form'), advantage, disadvantage))
						},
						advantageBtn: {
							icon: `<div data-tooltip="${game.i18n.localize('CTHACK.Advantage')}"><i class="fas fa-plus"></i>`,
							callback: (html) => resolve(roll(parts, 1, html[0].querySelector('form'), advantage, disadvantage))
						}
					},
					default: 'normalBtn',
					close: () => resolve(null)
				},
				dialogFinalOptions
			).render(true);
		});
	} else if (rollType === 'AttackDamage') {
		// Create the Dialog window
		return new Promise((resolve) => {
			new Dialog(
				{
					title: title,
					content: html,
					buttons: {
						normalBtn: {
							icon: `<div class="tooltip"><i class="fas fa-check"></i><span class="tooltiptextleft">${game.i18n.localize('CTHACK.Normal')}</span></div>`,
							callback: (html) => resolve(roll(parts, 0, html[0].querySelector('form'), advantage, disadvantage))
						}
					},
					default: 'normalBtn',
					close: () => resolve(null)
				},
				dialogFinalOptions
			).render(true);
		});
	}
}

export function configureDiceSoNice(dice3d) {

		dice3d.addSystem({id: "cthack", name: "Cthulhu Hack"}, "preferred");

		dice3d.addColorset({
			name: 'cthack',
			description: "Cthulhu Hack Default",
			category: "Cthulhu Hack",
			foreground: '#000000',
			background: "#000000",
			texture: 'none',
			edge: '#000000',
			material: 'plastic',
			visibility: 'visible'
		},"preferred");		

		dice3d.addDicePreset({
			type: "d4",
			labels: [
				"systems/cthack/ui/dice/d4/d4-1.webp",
				"systems/cthack/ui/dice/d4/d4-2.webp",
				"systems/cthack/ui/dice/d4/d4-3.webp",
				"systems/cthack/ui/dice/d4/d4-4.webp",
			],
			system: "cthack"
		});

		dice3d.addDicePreset({
			type: "d6",
			labels: [
				"systems/cthack/ui/dice/d6/d6-1.webp",
				"systems/cthack/ui/dice/d6/d6-2.webp",
				"systems/cthack/ui/dice/d6/d6-3.webp",
				"systems/cthack/ui/dice/d6/d6-4.webp",
				"systems/cthack/ui/dice/d6/d6-5.webp",
				"systems/cthack/ui/dice/d6/d6-6.webp"
			],
			system: "cthack"
		});	

		dice3d.addDicePreset({
			type: "d8",
			labels: [
				"systems/cthack/ui/dice/d8/d8-1.webp",
				"systems/cthack/ui/dice/d8/d8-2.webp",
				"systems/cthack/ui/dice/d8/d8-3.webp",
				"systems/cthack/ui/dice/d8/d8-4.webp",
				"systems/cthack/ui/dice/d8/d8-5.webp",
				"systems/cthack/ui/dice/d8/d8-6.webp",
				"systems/cthack/ui/dice/d8/d8-7.webp",
				"systems/cthack/ui/dice/d8/d8-8.webp"
			],
			system: "cthack"
		});

		dice3d.addDicePreset({
			type: "d10",
			labels: [
				"systems/cthack/ui/dice/d10/d10-1.webp",
				"systems/cthack/ui/dice/d10/d10-2.webp",
				"systems/cthack/ui/dice/d10/d10-3.webp",
				"systems/cthack/ui/dice/d10/d10-4.webp",
				"systems/cthack/ui/dice/d10/d10-5.webp",
				"systems/cthack/ui/dice/d10/d10-6.webp",
				"systems/cthack/ui/dice/d10/d10-7.webp",
				"systems/cthack/ui/dice/d10/d10-8.webp",
				"systems/cthack/ui/dice/d10/d10-9.webp",
				"systems/cthack/ui/dice/d10/d10-10.webp"
			],
			system: "cthack"
		});

		dice3d.addDicePreset({
			type: "d12",
			labels: [
				"systems/cthack/ui/dice/d12/d12-1.webp",
				"systems/cthack/ui/dice/d12/d12-2.webp",
				"systems/cthack/ui/dice/d12/d12-3.webp",
				"systems/cthack/ui/dice/d12/d12-4.webp",
				"systems/cthack/ui/dice/d12/d12-5.webp",
				"systems/cthack/ui/dice/d12/d12-6.webp",
				"systems/cthack/ui/dice/d12/d12-7.webp",
				"systems/cthack/ui/dice/d12/d12-8.webp",
				"systems/cthack/ui/dice/d12/d12-9.webp",
				"systems/cthack/ui/dice/d12/d12-10.webp",
				"systems/cthack/ui/dice/d12/d12-11.webp",
				"systems/cthack/ui/dice/d12/d12-12.webp",
			],
			system: "cthack"
		});	

		dice3d.addDicePreset({
			type: "d20",
			labels: [
				"systems/cthack/ui/dice/d20/d20-1.webp",
				"systems/cthack/ui/dice/d20/d20-2.webp",
				"systems/cthack/ui/dice/d20/d20-3.webp",
				"systems/cthack/ui/dice/d20/d20-4.webp",
				"systems/cthack/ui/dice/d20/d20-5.webp",
				"systems/cthack/ui/dice/d20/d20-6.webp",
				"systems/cthack/ui/dice/d20/d20-7.webp",
				"systems/cthack/ui/dice/d20/d20-8.webp",
				"systems/cthack/ui/dice/d20/d20-9.webp",
				"systems/cthack/ui/dice/d20/d20-10.webp",
				"systems/cthack/ui/dice/d20/d20-11.webp",
				"systems/cthack/ui/dice/d20/d20-12.webp",
				"systems/cthack/ui/dice/d20/d20-13.webp",
				"systems/cthack/ui/dice/d20/d20-14.webp",
				"systems/cthack/ui/dice/d20/d20-15.webp",
				"systems/cthack/ui/dice/d20/d20-16.webp",
				"systems/cthack/ui/dice/d20/d20-17.webp",
				"systems/cthack/ui/dice/d20/d20-18.webp",
				"systems/cthack/ui/dice/d20/d20-19.webp",
				"systems/cthack/ui/dice/d20/d20-20.webp"
			],
			system: "cthack"
		});	
}