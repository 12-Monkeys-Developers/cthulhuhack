import { CTHACK } from '../config.js';
import { diceRoll } from '../dice.js';
import { formatDate, findLowerDice } from '../utils.js';
import { LOG_HEAD } from '../constants.js';

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class CtHackActor extends Actor {
	/** @override */
	prepareData() {
		super.prepareData();

		/*
		const actorData = this.data;
		const data = actorData.data;
		const flags = actorData.flags;
		*/

	}

	/** @override */
	prepareDerivedData() {
		switch (this.type) {
			case 'character':
				return;
			case 'opponent':
				return this._prepareOpponentDerivedData(this.system);
		}
	}

	/**
   * Prepare opponent type-specific data
   * @param actorData
   * @private
   */
	_prepareOpponentDerivedData(systemData) {
		systemData.malus = -1 * (systemData.hitDice - 1);
	}

	/**
     * @name rollSave
     * @description Roll a Saving Throw 
     *              Prompt the user for input regarding Advantage/Disadvantage
     * @public
	 * 
     * @param {String} saveId       The save ID (e.g. "str")
   	 * @param {Object} options      Options which configure how save tests are rolled
	 * 
     * @returns {Promise<Roll>}      A Promise which resolves to the created Roll instance
     */
	async rollSave(saveId, options = {}) {
		if (CTHACK.debug) console.log(`${LOG_HEAD}Roll save ${saveId}`);
		const save = CTHACK.saves[saveId];
		const label = game.i18n.localize(save);
		const saveValue = this.system.saves[saveId].value;
		const abilitiesAdvantages = this._findSavesAdvantages(saveId);
		let hasAdvantage = false;
		let hasDisadvantage = false;
		if (this.getFlag('cthack', 'disadvantageOOA') !== undefined && this.getFlag('cthack', 'disadvantageOOA') === true) {
			if (CTHACK.debug) console.log('CTHACK | Out of Action Disadvantage');
			hasDisadvantage = true;
		}

		// Roll and return
		const rollData = mergeObject(options, {			
			rollType: 'Save',
			title: game.i18n.format('CTHACK.SavePromptTitle', { save: label }),
			rollId: label,
			targetValue: saveValue,
			abilitiesAdvantages: abilitiesAdvantages,
			advantage: hasAdvantage,
			disadvantage: hasDisadvantage
		});
		rollData.speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });
		return await diceRoll(rollData);
	}

	/**
     * @name rollResource
     * @description Roll a Saving Throw 
     *              Prompt the user for input regarding Advantage/Disadvantage
     * @public
	 * 
     * @param {String} resourceId   The resource ID (e.g. "smokes")
     * @param {Object} options      Options which configure how resource tests are rolled
	 *
     * @returns {Promise<Roll>}      A Promise which resolves to the created Roll instance
     */
	async rollResource(resourceId, options = {}) {
		if (CTHACK.debug) console.log(`${LOG_HEAD}Roll resource ${resourceId}`);
		const label = game.i18n.localize(CTHACK.attributes[resourceId]);
		const resourceValue = this.system.attributes[resourceId].value;

		// Resource at 0
		if (resourceValue === '0') {
			return ui.notifications.warn(game.i18n.format('MACROS.ResourceAtZero', { resourceName: label }));
		}

		let title;

		if (resourceId != 'miscellaneous') {
			title = game.i18n.format('CTHACK.ResourceRollPromptTitle', { resource: label });
		} else {
			if (game.settings.get('cthack', 'MiscellaneousResource')) {
				title = game.i18n.format('CTHACK.ResourceRollPromptTitle', { resource: game.settings.get('cthack', 'MiscellaneousResource') });
			} else {
				const resourceName = ame.i18n.format('CTHACK.Misc');
				title = game.i18n.format('CTHACK.ResourceRollPromptTitle', { resource: resourceName });
			}
		}

		// Roll and return
		const rollData = mergeObject(options, {						
			rollType: 'Resource',
			title: title,
			rollId: title,
			diceType: resourceValue
		});
		rollData.speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });

		let rollResource = await diceRoll(rollData);

		// Resource loss
		if (rollResource && (rollResource.total === 1 || rollResource.total === 2)) {
			await this.decreaseResource(resourceId);
		}
	}

	/**
   * Roll a Material dice
   * @param {Item} item         The item used for the roll
   * @param {Object} options      Options which configure how resource tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
	async rollMaterial(item, options = {}) {
		const dice = item.system.dice;

		if (CTHACK.debug) console.log(`${LOG_HEAD}Roll dice ${dice} for material ${item.name}`);

		// Material without resource
		if (item.system.dice === '') {
			return ui.notifications.warn(game.i18n.format('MACROS.ObjectWithoutResource', { itemName: item.name }));
		}
		// Material with resource at 0
		if (item.system.dice === '0') {
			return ui.notifications.warn(game.i18n.format('MACROS.ObjectEmptyResource', { itemName: item.name }));
		}

		const materialName = item.name;
		const message = game.i18n.format('CTHACK.MaterialRollDetails', { material: materialName });

		// Roll and return
		const rollData = mergeObject(options, {
			rollType: 'Material',
			title: game.i18n.format('CTHACK.MaterialRollPromptTitle') + ' : ' + item.name,
			rollId: message,
			diceType: dice
		});
		rollData.speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });

		let rollMaterial = await diceRoll(rollData);

		// Resource loss
		if (rollMaterial && (rollMaterial.total === 1 || rollMaterial.total === 2)) {
			await this._decreaseMaterialResource(item.id, item.system.dice);
		}
	}

	/**
	 * @name useAbility
	 * @description 		Handles ability use
	 * 						Decreases the usage left by 1
	 * 						Display the time of the use
	 * @public
	 * 
	 * @param {*} ability   The ability item used
	 * 
	 */

	useAbility(ability) {
		if (CTHACK.debug) console.log(`${LOG_HEAD}Use ability ${ability.name}`);
		let remaining = ability.system.uses.value;
		if (remaining === 0) {
			return;
		}
		if (remaining > 0) {
			remaining--;
		}
		const now = new Date();
		const lastTime = formatDate(now);
		ability.update({ 'data.uses.value': remaining, 'data.uses.last': lastTime });
	}

	/**
	 * @name resetAbility
	 * @description 		Handles ability reset
	 * 						Reset usage to max
	 * 						Reset the last time of the use
	 * @public
	 * 
	 * @param {*} ability   The ability item used
	 * 
	 */

	 resetAbility(ability) {
		if (CTHACK.debug) console.log(`${LOG_HEAD}Reset ability ${ability.name}`);
		ability.update({ 'data.uses.value': ability.system.uses.max, 'data.uses.last': '' });
	}

	/**
	 * Decrease a material dice
	 * @param {String} itemId   The id of the item
	 * @param {String} dice   "d4""
	 */
	async _decreaseMaterialResource(itemId, dice) {
		const newDiceValue = findLowerDice(dice);
		this.updateEmbeddedDocuments("Item", [{ _id: itemId, 'data.dice': newDiceValue }]);
	}

	/**
   * Decrease a Resource dice
   * @param {String} resourceId   The resource ID (e.g. "smo")
   */
	async decreaseResource(resourceId) {
		if (CTHACK.debug) console.log(`${LOG_HEAD}Decrease resource ${resourceId}`);
		const actorResource = this.system.attributes[resourceId];

		// old value is 0 or dx
		const oldValue = actorResource.value;
		if (oldValue != '0') {
			let newValue = findLowerDice(oldValue);
			actorResource.value = newValue;
			if (resourceId === 'flashlights') {
				await this.update({ 'data.attributes.flashlights': actorResource });
			} else if (resourceId === 'smokes') {
				await this.update({ 'data.attributes.smokes': actorResource });
			} else if (resourceId === 'sanity') {
				await this.update({ 'data.attributes.sanity': actorResource });
			}
		}
	}

	/**
   * Roll an armed or unarmed damage
   * @param {String} damageId     The damage ID (e.g. "armed" "unarmed")
   * @param {Object} options      Options which configure how damage tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
	async rollDamageRoll(damageId, options = {}) {
		if (CTHACK.debug) console.log(`${LOG_HEAD}Roll ${damageId} roll`);

		const damageDice = this.system.attributes[damageId].value;

		if (damageDice == 1) {
			return;
		}

		const damage = CTHACK.attributes[damageId];
		const label = game.i18n.localize(damage);

		// Roll and return
		const rollData = mergeObject(options, {			
			rollType: 'Damage',
			title: label,
			rollId: label,
			diceType: damageDice
		});
		rollData.speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });
		return await diceRoll(rollData);
	}

	/**
	 * Roll an attack damage
	 * @param {Item} item   		Item of type attack for opponent
	 * @param {Object} options      Options which configure how damage tests are rolled
	 * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
	 */
	async rollAttackDamageRoll(item, options = {}) {
		const itemData = item.data;
		if (CTHACK.debug) console.log(`${LOG_HEAD}Attack roll for ${item.name} with a ${item.system.damageDice} dice`);

		const label = game.i18n.format('CTHACK.AttackDamageDiceRollPrompt', { item: item.name });

		// Custom Formula ?
		let isCustomFormula = false;

		// If there is a + in the formula, it's a custom Formula
		const count = item.system.damageDice.includes("+");
		if (count != null) isCustomFormula = true;

		// If the first character is not d, it's a custom Formula, 2d6 by exemple
		if (item.system.damageDice.charAt(0) !== 'd') isCustomFormula = true;

		// Roll and return
		const rollData = mergeObject(options, {
			rollType: 'AttackDamage',
			title: label,
			rollId: label,
			diceType: isCustomFormula === false ? item.system.damageDice : null,
			customFormula: isCustomFormula === true ? item.system.damageDice : null			
		});
		rollData.speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });
		return await diceRoll(rollData);
	}

	/**
	 * 
	 * @param {*} key 
	 * @param {*} itemId 
	 */
	async deleteAbility(key, itemId) {
		const index = this._findAbilityIndex(key, itemId);
		if (index !== -1) {
			let abilitiesList = this.system.abilities;
			abilitiesList.splice(index, 1);

			await this.update({ 'data.abilities': abilitiesList });
		}
	}

	/**
	 * 
	 * @param {*} key 
	 * @param {*} id 
	 * @returns 
	 */
	_findAbilityIndex(key, id) {
		let abilitiesList = this.system.abilities;
		let trouve = false;
		let index = -1;
		let i = 0;
		while (!trouve && i < abilitiesList.length) {
			if (key === abilitiesList[i].key) {
				trouve = true;
				index = i;
			}
			i++;
		}

		if (index === -1) {
			if (CTHACK.debug) console.log(`La capacité de clé ${key} n'a pas été trouvée dans la liste.`);
		}
		return index;
	}

	/**
	 * 
	 * @param {*} saveId 
	 * @returns 
	 */
	_findSavesAdvantages(saveId) {
		let advantages = '<ul>';
		let abilitiesList = this.system.abilities;
		for (let index = 0; index < abilitiesList.length; index++) {
			const element = abilitiesList[index];
			if (element.key === 'SWILEA' && (saveId === 'str' || saveId === 'dex' || saveId === 'con')) {
				advantages += '<li>' + game.i18n.localize('CTHACK.AdvantageSWILEA') + '</li>';
			}
			if (element.key === 'STA') {
				advantages += '<li>' + game.i18n.localize('CTHACK.AdvantageSTA') + '</li>';
			}
			if (element.key === 'ANIHAN') {
				advantages += '<li>' + game.i18n.localize('CTHACK.AdvantageANIHAN') + '</li>';
			}
			if (element.key === 'IND' && (saveId === 'wis' || saveId === 'int' || saveId === 'cha')) {
				advantages += '<li>' + game.i18n.localize('CTHACK.AdvantageIND') + '</li>';
			}
			if (element.key === 'MEC') {
				advantages += '<li>' + game.i18n.localize('CTHACK.AdvantageMEC') + '</li>';
			}
			if (element.key === 'IROMIN') {
				advantages += '<li>' + game.i18n.localize('CTHACK.AdvantageIROMIN') + '</li>';
			}
			if (element.key === 'RIP' && saveId === 'str') {
				advantages += '<li>' + game.i18n.localize('CTHACK.AdvantageRIP') + '</li>';
			}
			if (element.key === 'LEG') {
				advantages += '<li>' + game.i18n.localize('CTHACK.AdvantageLEG') + '</li>';
			}
			if (element.key === 'SELPRE') {
				advantages += '<li>' + game.i18n.localize('CTHACK.AdvantageSELPRE') + '</li>';
			}
			if (element.key === 'HAR') {
				advantages += '<li>' + game.i18n.localize('CTHACK.AdvantageHAR') + '</li>';
			}
		}

		const customAdvantagesText = this._findSavesAdvantagesFromCustomAbilities();
		if (customAdvantagesText != '') {
			advantages += customAdvantagesText;
		}

		if (advantages === '<ul>') {
			advantages = '';
		} else advantages += '</ul>';
		return advantages;
	}

	/**
	 * @name _findSavesAdvantagesFromCustomAbilities
	 * @private
	 * 
	 * @description Find advantages given by custom abilitites
	 * 
	 * @returns 
	 */
	_findSavesAdvantagesFromCustomAbilities() {
		let customAdvantagesText = '';
		this.items.forEach((element) => {
			if (element.type === 'ability' && element.system.isCustom && element.system.advantageGiven && element.system.advantageText !== '') {
				customAdvantagesText += '<li>' + element.system.advantageText + '</li>';
			}
		});
		return customAdvantagesText;
	}

	/**
   * Create a definition item with the active effect if necessary
   * @param {*} itemData 
   */
	async createDefinitionItem(itemData) {
		if (itemData.data.key === 'OOA-CRB' || itemData.data.key === 'OOA-MIC' || itemData.data.key === 'OOA-STA' || itemData.data.key === 'OOA-WIN') {
			this._createActiveEffect(itemData);
		} else if (itemData.data.key.startsWith('OOA') || itemData.data.key.startsWith('TI') || itemData.data.key.startsWith('SK')) {
			this._createActiveEffect(itemData);
		}

		// Create the owned item
		return this.createEmbeddedDocuments('Item', [itemData], { renderSheet: true });
	}

	/**
	 * 
	 * @param {*} itemData 
	 */
	async _createActiveEffect(itemData) {
		if (CTHACK.debug) console.log(`CTHACK | Create active Effect with itemData ${itemData}`);

		let effectData;

		if (itemData.data.key === 'OOA-CRB') {
			effectData = {
				label: 'OOA-CRB',
				icon: 'systems/cthack/ui/icons/first-aid-kit.png',
				changes: [
					{
						key: 'data.saves.str.value',
						mode: 2,
						value: -4,
						priority: '20'
					},
					{
						key: 'data.saves.dex.value',
						mode: 2,
						value: -4,
						priority: '20'
					},
					{
						key: 'data.saves.con.value',
						mode: 2,
						value: -4,
						priority: '20'
					}
				],
				duration: {
					seconds: 3600
				},
				tint: '#BB0022'
			};
		} else if (itemData.data.key === 'OOA-MIC') {
			effectData = {
				label: 'OOA-MIC',
				icon: 'systems/cthack/ui/icons/first-aid-kit.png',
				duration: {
					seconds: 1200
				},
				tint: '#BB0022'
			};
			await this.setFlag('cthack', 'disadvantageOOA', true);
		} else if (itemData.data.key === 'OOA-STA') {
			effectData = {
				label: 'OOA-STA',
				icon: 'systems/cthack/ui/icons/first-aid-kit.png',
				duration: {
					seconds: 600
				},
				tint: '#BB0022'
			};
			await this.setFlag('cthack', 'disadvantageOOA', true);
		} else if (itemData.data.key === 'OOA-WIN') {
			effectData = {
				label: 'OOA-WIN',
				icon: 'systems/cthack/ui/icons/first-aid-kit.png',
				duration: {
					seconds: 60
				},
				tint: '#BB0022'
			};
			await this.setFlag('cthack', 'disadvantageOOA', true);
		} else if (itemData.data.key.startsWith('OOA')) {
			effectData = {
				label: itemData.data.key,
				icon: 'systems/cthack/ui/icons/first-aid-kit.png',
				duration: {
					seconds: 3600
				},
				tint: '#BB0022'
			};
		} else if (itemData.data.key.startsWith('TI')) {
			effectData = {
				label: itemData.data.key,
				icon: 'systems/cthack/ui/icons/screaming.png',
				duration: {
					seconds: 3600
				},
				tint: '#BB0022'
			};
		} else if (itemData.data.key.startsWith('SK')) {
			effectData = {
				label: itemData.data.key,
				icon: 'systems/cthack/ui/icons/dead-head.png',
				duration: {
					seconds: 3600
				},
				tint: '#BB0022'
			};
		}

		// Create the Active Effect
		this.createEmbeddedDocuments('ActiveEffect', [effectData]);
	}

	/**
	 * @name deleteEffectFromItem
	 * 
	 * @description Delete the associated active effect of a definition item if necessary
	 * 
	 * @param {*} item 
	 */
	async deleteEffectFromItem(item) {
		// Delete the Active Effect
		let effect;
		const definitionKey = item.system.key;
		if (CTHACK.debug) console.log('CTHACK | deleteDefinitionItem : definitionKey = ' + definitionKey);
		if (definitionKey === 'OOA-CRB') {
			effect = this.effects.find((i) => i.data.label === definitionKey);
			if (CTHACK.debug) console.log('CTHACK | Delete Active Effect : ' + effect.data._id);
			await this.deleteEmbeddedDocuments('ActiveEffect', [effect.data._id]);
		} else if (definitionKey === 'OOA-MIC' || definitionKey === 'OOA-STA' || definitionKey === 'OOA-WIN') {
			effect = this.effects.find((i) => i.data.label === definitionKey);
			if (CTHACK.debug) console.log('CTHACK | Delete Active Effect : ' + effect.data._id);
			await this.deleteEmbeddedDocuments('ActiveEffect', [effect.data._id]);
			await this.unsetFlag('cthack', 'disadvantageOOA');
		} else if (definitionKey.startsWith('OOA')) {
			effect = this.effects.find((i) => i.data.label === definitionKey);
			if (CTHACK.debug) console.log('CTHACK | Delete Active Effect : ' + effect.data._id);
			await this.deleteEmbeddedDocuments('ActiveEffect', [effect.data._id]);
		} else if (definitionKey.startsWith('TI')) {
			effect = this.effects.find((i) => i.data.label === definitionKey);
			if (CTHACK.debug) console.log('CTHACK | Delete Active Effect : ' + effect.data._id);
			await this.deleteEmbeddedDocuments('ActiveEffect', [effect.data._id]);
		} else if (definitionKey.startsWith('SK')) {
			effect = this.effects.find((i) => i.data.label === definitionKey);
			if (CTHACK.debug) console.log('CTHACK | Delete Active Effect : ' + effect.data._id);
			await this.deleteEmbeddedDocuments('ActiveEffect', [effect.data._id]);
		}
	}

	/**
     * @name getAvailableAttributes
     * @description Get attributes for an actor
     *              Depends on settings
	 * 				Don't return adrenaline1 and adrenaline2
	 * 				Used for the module Token Action HUD
     * @public
	 * 
     * @returns 	An array (key/values) of available attributes
     */
	getAvailableAttributes() {
		let availableAttributes = Object.entries(this.system.attributes).filter(function(a) {
			if (a[0] === 'adrenaline1' || a[0] === 'adrenaline2') {
				return false;
			}
			if (a[0] === 'hitDice' && !game.settings.get('cthack', 'HitDiceResource')) {
				return false;
			}
			if (a[0] === 'wealthDice' && (!game.settings.get('cthack', 'WealthResource') || game.settings.get('cthack', 'MiscellaneousResource') !== '')) {
				return false;
			}
			if (a[0] === 'miscellaneous' && game.settings.get('cthack', 'MiscellaneousResource') === '') {
				return false;
			}
			return true;
		});

		return availableAttributes;
	}
}
