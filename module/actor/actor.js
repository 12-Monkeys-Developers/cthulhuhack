import { CTHACK } from '../config.js';
import { diceRoll } from '../dice.js';
import { formatDate, findLowerDice } from '../utils.js';

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class CtHackActor extends Actor {
	/** @override */
	prepareData() {
		super.prepareData();

		const actorData = this.data;
		const data = actorData.data;
		const flags = actorData.flags;

		// Make separate methods for each Actor type (character, npc, etc.) to keep things organized.
	}

	/** @override */
	prepareDerivedData() {
		switch (this.data.type) {
			case 'character':
				return;
			case 'opponent':
				return this._prepareOpponentDerivedData(this.data);
		}
	}

	/**
   * Prepare opponent type-specific data
   * @param actorData
   * @private
   */
	_prepareOpponentDerivedData(actorData) {
		const data = actorData.data;
		data.malus = -1 * (data.hitDice - 1);
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
		if (CTHACK.debug) console.log(`Roll save ${saveId}`);
		const save = CTHACK.saves[saveId];
		const label = game.i18n.localize(save);
		const saveValue = this.data.data.saves[saveId].value;
		const abilitiesAdvantages = this._findSavesAdvantages(saveId);
		let hasAdvantage = false;
		let hasDisadvantage = false;
		if (this.getFlag('cthack', 'disadvantageOOA') !== undefined && this.getFlag('cthack', 'disadvantageOOA') === true) {
			if (CTHACK.debug) console.log('Out of Action Disadvantage');
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
		if (CTHACK.debug) console.log(`Roll resource ${resourceId}`);
		const label = game.i18n.localize(CTHACK.attributes[resourceId]);
		const resourceValue = this.data.data.attributes[resourceId].value;

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
		if (rollResource && (rollResource.results[0] === 1 || rollResource.results[0] === 2)) {
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
		const dice = item.data.data.dice;

		if (CTHACK.debug) console.log(`Roll dice ${dice} for material ${item.name}`);

		// Material without resource
		if (item.data.data.dice === '') {
			return ui.notifications.warn(game.i18n.format('MACROS.ObjectWithoutResource', { itemName: item.name }));
		}
		// Material with resource at 0
		if (item.data.data.dice === '0') {
			return ui.notifications.warn(game.i18n.format('MACROS.ObjectEmptyResource', { itemName: item.name }));
		}

		const materialName = item.data.name;
		const message = game.i18n.format('CTHACK.MaterialRollDetails', { material: materialName });

		// Roll and return
		const rollData = mergeObject(options, {
			rollType: 'Material',
			title: game.i18n.format('CTHACK.MaterialRollPromptTitle') + ' : ' + item.data.name,
			rollId: message,
			diceType: dice
		});
		rollData.speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });

		let rollMaterial = await diceRoll(rollData);

		// Resource loss
		if (rollMaterial && (rollMaterial.results[0] === 1 || rollMaterial.results[0] === 2)) {
			await this._decreaseMaterialResource(item._id, item.data.data.dice);
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
		if (CTHACK.debug) console.log(`Use ability ${ability.name}`);
		let remaining = ability.data.data.uses.value;
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
	 * Decrease a material dice
	 * @param {String} itemId   The id of the item
	 * @param {String} dice   "d4""
	 */
	async _decreaseMaterialResource(itemId, dice) {
		const newDiceValue = findLowerDice(dice);
		this.updateOwnedItem({ _id: itemId, 'data.dice': newDiceValue });
	}

	/**
   * Decrease a Resource dice
   * @param {String} resourceId   The resource ID (e.g. "smo")
   */
	async decreaseResource(resourceId) {
		if (CTHACK.debug) console.log(`Decrease resource ${resourceId}`);
		const actorData = this.data;
		const actorResource = actorData.data.attributes[resourceId];

		// old value is 0 or dx
		const oldValue = actorResource.value;
		if (oldValue != '0') {
			let newValue = findLowerDice(oldValue);
			actorResource.value = newValue;
			if (resourceId === 'flashlights') {
				this.update({ 'data.attributes.flashlights': actorResource });
			} else if (resourceId === 'smokes') {
				this.update({ 'data.attributes.smokes': actorResource });
			} else if (resourceId === 'sanity') {
				this.update({ 'data.attributes.sanity': actorResource });
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
		if (CTHACK.debug) console.log(`Roll ${damageId} roll`);

		const damageDice = this.data.data.attributes[damageId].value;

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
   * @param {Item} item   		  Item of type attack for opponent
   * @param {Object} options      Options which configure how damage tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
	async rollAttackDamageRoll(item, options = {}) {
		const itemData = item.data;
		if (CTHACK.debug) console.log(`Attack roll for ${itemData.name} with a ${itemData.data.damageDice} dice`);

		const label = game.i18n.format('CTHACK.AttackDamageDiceRollPrompt', { item: itemData.name });

		// If there is a + in the formula, it's a custom Formula
		let count = itemData.data.damageDice.match(/"+"/g);

		// Roll and return
		const rollData = mergeObject(options, {
			rollType: 'AttackDamage',
			title: label,
			rollId: label,
			diceType: count === null ? itemData.data.damageDice : null,
			customFormula: count !== null ? itemData.data.damageDice : null			
		});
		rollData.speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });
		return await diceRoll(rollData);
	}

	/**
	 * 
	 * @param {*} key 
	 * @param {*} itemId 
	 */
	deleteAbility(key, itemId) {
		const index = this._findAbilityIndex(key, itemId);
		if (index !== -1) {
			let abilitiesList = this.data.data.abilities;
			abilitiesList.splice(index, 1);

			this.update({ 'data.abilities': abilitiesList });
		}
	}

	/**
	 * 
	 * @param {*} key 
	 * @param {*} id 
	 * @returns 
	 */
	_findAbilityIndex(key, id) {
		let abilitiesList = this.data.data.abilities;
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
		return index;
	}

	/**
	 * 
	 * @param {*} saveId 
	 * @returns 
	 */
	_findSavesAdvantages(saveId) {
		let advantages = '<ul>';
		let abilitiesList = this.data.data.abilities;
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
		this.data.items.forEach((element) => {
			if (element.type === 'ability' && element.data.isCustom && element.data.advantageGiven && element.data.advantageText !== '') {
				customAdvantagesText += '<li>' + element.data.advantageText + '</li>';
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
		return this.createEmbeddedDocuments('OwnedItem', itemData, { renderSheet: true });
	}

	/**
	 * 
	 * @param {*} itemData 
	 */
	async _createActiveEffect(itemData) {
		if (CTHACK.debug) console.log(itemData);

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
		this.createEmbeddedEntity('ActiveEffect', effectData);
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
		const definitionKey = item.data.data.key;
		if (CTHACK.debug) console.log('deleteDefinitionItem : definitionKey = ' + definitionKey);
		if (definitionKey === 'OOA-CRB') {
			effect = this.effects.find((i) => i.data.label === definitionKey);
			if (CTHACK.debug) console.log('Delete Active Effect : ' + effect.data._id);
			await this.deleteEmbeddedEntity('ActiveEffect', effect.data._id);
		} else if (definitionKey === 'OOA-MIC' || definitionKey === 'OOA-STA' || definitionKey === 'OOA-WIN') {
			effect = this.effects.find((i) => i.data.label === definitionKey);
			if (CTHACK.debug) console.log('Delete Active Effect : ' + effect.data._id);
			await this.deleteEmbeddedEntity('ActiveEffect', effect.data._id);
			await this.unsetFlag('cthack', 'disadvantageOOA');
		} else if (definitionKey.startsWith('OOA')) {
			effect = this.effects.find((i) => i.data.label === definitionKey);
			if (CTHACK.debug) console.log('Delete Active Effect : ' + effect.data._id);
			await this.deleteEmbeddedEntity('ActiveEffect', effect.data._id);
		} else if (definitionKey.startsWith('TI')) {
			effect = this.effects.find((i) => i.data.label === definitionKey);
			if (CTHACK.debug) console.log('Delete Active Effect : ' + effect.data._id);
			await this.deleteEmbeddedEntity('ActiveEffect', effect.data._id);
		} else if (definitionKey.startsWith('SK')) {
			effect = this.effects.find((i) => i.data.label === definitionKey);
			if (CTHACK.debug) console.log('Delete Active Effect : ' + effect.data._id);
			await this.deleteEmbeddedEntity('ActiveEffect', effect.data._id);
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
		let availableAttributes = Object.entries(this.data.data.attributes).filter(function(a) {
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
