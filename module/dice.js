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
	if (rollType === 'Save') {
		parts = parts.concat([ '@modifier' ]);
	}

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
		// Remove the @modifier if there is no modifier
		if (rollType === 'Save' && !data['modifier']) parts.pop();

		// Execute the roll
		let roll;

		// A malus is added to the dice result
		if (rollType === 'Save' && form.modifier.value < 0 ) {			
			roll = new Roll(parts.join(' + '), data);
		}
		else roll = new Roll(parts.join(' - '), data);

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
			if (modifier !== null && modifier != '') {
				roll.modifier = modifier;
			}

			if (roll.total < targetValue) {
				roll.isSuccess = true;
			} else {
				roll.isSuccess = false;
			}
			messageData.content = await renderTemplate(`systems/cthack/templates/chat/rollSave.hbs`, roll);
		}

		if (rollType === 'Resource' || rollType === 'Material') {
			// Resource roll
			if (roll.total == 1 || roll.total == 2) {
				roll.resourceLost = true;
				roll.isSuccess = false;
			} else roll.resourceLost = false;

			messageData.content = await renderTemplate(`systems/cthack/templates/chat/rollResource.hbs`, roll);
		}

		if (rollType === 'Damage') {
			messageData.content = await renderTemplate(`systems/cthack/templates/chat/rollOther.hbs`, roll);
		}

		if (rollType === 'AttackDamage') {
			messageData.content = await renderTemplate(`systems/cthack/templates/chat/rollOther.hbs`, roll);
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
	template = template || 'systems/cthack/templates/chat/roll-dialog.html';
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

	if (rollType !== 'Damage' && rollType !== 'AttackDamage') {
		// Create the Dialog window
		return new Promise((resolve) => {
			new Dialog(
				{
					title: title,
					content: html,
					buttons: {
						doubleDisadvantageBtn: {
							icon: `<div class="tooltip"><i class="fas fa-minus"></i> <i class="fas fa-minus"></i><span class="tooltiptextleft">${game.i18n.localize(
								'CTHACK.DoubleDisadvantage'
							)}</span></div>`,
							callback: (html) => resolve(roll(parts, -2, html[0].querySelector('form'), advantage, disadvantage))
						},
						disadvantageBtn: {
							icon: `<div class="tooltip"><i class="fas fa-minus"></i><span class="tooltiptextleft">${game.i18n.localize('CTHACK.Disadvantage')}</span></div>`,
							callback: (html) => resolve(roll(parts, -1, html[0].querySelector('form'), advantage, disadvantage))
						},
						normalBtn: {
							icon: `<div class="tooltip"><i class="fas fa-check"></i><span class="tooltiptextleft">${game.i18n.localize('CTHACK.Normal')}</span></div>`,
							callback: (html) => resolve(roll(parts, 0, html[0].querySelector('form'), advantage, disadvantage))
						},
						advantageBtn: {
							icon: `<div class="tooltip"><i class="fas fa-plus"></i><span class="tooltiptextright">${game.i18n.localize('CTHACK.Advantage')}</span></div>`,
							callback: (html) => resolve(roll(parts, 1, html[0].querySelector('form'), advantage, disadvantage))
						},
						doubleAdvantageBtn: {
							icon: `<div class="tooltip"><i class="fas fa-plus"></i> <i class="fas fa-plus"></i><span class="tooltiptextright">${game.i18n.localize(
								'CTHACK.DoubleAdvantage'
							)}</span></div>`,
							callback: (html) => resolve(roll(parts, 2, html[0].querySelector('form'), advantage, disadvantage))
						}
					},
					default: 'normalBtn',
					close: () => resolve(null)
				},
				dialogOptions
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
							icon: `<div class="tooltip"><i class="fas fa-minus"></i><span class="tooltiptextleft">${game.i18n.localize('CTHACK.Disadvantage')}</span></div>`,
							callback: (html) => resolve(roll(parts, -1, html[0].querySelector('form'), advantage, disadvantage))
						},
						normalBtn: {
							icon: `<div class="tooltip"><i class="fas fa-check"></i><span class="tooltiptextleft">${game.i18n.localize('CTHACK.Normal')}</span></div>`,
							callback: (html) => resolve(roll(parts, 0, html[0].querySelector('form'), advantage, disadvantage))
						},
						advantageBtn: {
							icon: `<div class="tooltip"><i class="fas fa-plus"></i><span class="tooltiptextright">${game.i18n.localize('CTHACK.Advantage')}</span></div>`,
							callback: (html) => resolve(roll(parts, 1, html[0].querySelector('form'), advantage, disadvantage))
						}
					},
					default: 'normalBtn',
					close: () => resolve(null)
				},
				dialogOptions
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
				dialogOptions
			).render(true);
		});
	}
}

/*export class Die6Cthack extends Die {
    constructor(termData){
        termData.faces = 6;
        super(termData);
    }

    
    static diceSoNiceReady(dice3d) {
        dice3d.addSystem({id: "cthack", name: "Cthulhu Hack"}, "preferred");
        
        dice3d.addDicePreset({
            type: "d6",
            labels: [
                "systems/cthack/ui/dice/dsn/D6_1.png",
                "systems/cthack/ui/dice/dsn/D6_2.png",
                "systems/cthack/ui/dice/dsn/D6_3.png",
                "systems/cthack/ui/dice/dsn/D6_4.png",
                "systems/cthack/ui/dice/dsn/D6_5.png",
                "systems/cthack/ui/dice/dsn/D6_6.png",
            ],
            system: "cthack"
        });
        
    }
}*/

/*
export class Die4Cthack extends Die {
    constructor(termData){
        termData.faces = 4;
        super(termData);
    }

    
    static diceSoNiceReady(dice3d) {
        dice3d.addSystem({id: "cthack", name: "Cthulhu Hack"}, "preferred");
        
        dice3d.addDicePreset({
            type: "d4",
            labels: [
                "systems/cthack/ui/dice/dsn/D4_1.webp",
                "systems/cthack/ui/dice/dsn/D4_2.webp",
                "systems/cthack/ui/dice/dsn/D4_3.webp",
                "systems/cthack/ui/dice/dsn/D4_4.webp"
            ],
            system: "cthack"
        });
        
    }
}
*/

