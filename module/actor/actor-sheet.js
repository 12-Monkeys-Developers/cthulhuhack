import { formatDate, findLowerDice } from '../utils.js';

/**
 * Extend the basic ActorSheet
 * @extends {ActorSheet}
 */
export class CtHackActorSheet extends ActorSheet {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: [ 'cthack', 'sheet', 'actor', 'character' ],
			width: 880,
			height: 720,
			tabs: [ { navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'items' } ],
			dragDrop: [{ dragSelector: ".items-list .item", dropSelector: null }]
		});
	}

	/** @override */
	get template() {
		return 'systems/cthack/templates/actor/actor-sheet.hbs';
	}

	/** @override */
	getData() {
		const data = super.getData();

		data.abilities = data.items.filter(function(item) {
			return item.type === 'ability';
		});
		data.weapons = data.items.filter(function(item) {
			return item.type === 'weapon';
		});
		data.otheritems = data.items.filter(function(item) {
			return item.type === 'item';
		});
		data.conditions = data.items.filter(function(item) {
			return item.type === 'definition';
		});

		data.isGm = game.user.isGM;

		return data;
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		// Item summaries
		html.find('.item .item-name h4').click((event) => this._onItemSummary(event));

		// Add, Update or Delete Inventory
		html.find('.item-create').click(this._onItemCreate.bind(this));
		html.find('.item-edit').click((ev) => {
			const li = $(ev.currentTarget).parents('.item');
			const item = this.actor.getOwnedItem(li.data('itemId'));
			item.sheet.render(true);
		});
		html.find('.item-delete').click(this._onItemDelete.bind(this));

		// Add, Update, Delete or Use Ability Item
		html.find('.ability-create').click(this._onItemCreate.bind(this));
		html.find('.ability-edit').click((ev) => {
			const li = $(ev.currentTarget).parents('.item');
			const item = this.actor.getOwnedItem(li.data('itemId'));
			item.sheet.render(true);
		});
		html.find('.ability-delete').click(this._onItemDelete.bind(this));
		html.find('.ability-use').click(this._onItemUse.bind(this));
		html.find('.ability-reset').click(this._onAbilityReset.bind(this));

		// Saving throws
		html.find('.save-name').click(this._onSaveRoll.bind(this));

		// Resource roll
		html.find('.resource-name').click(this._onResourceRoll.bind(this));

		// Armed and unarmed damage rolls
		html.find('.armed-damage-name').click(this._onDamagedRoll.bind(this));
		html.find('.unarmed-damage-name').click(this._onDamagedRoll.bind(this));

		// Wealth roll if the option is enabled
		if (game.settings.get('cthack', 'WealthResource')) {
			html.find('.wealth-name').click(this._onResourceRoll.bind(this));
		}

		// HitDice roll if the option is enabled
		if (game.settings.get('cthack', 'HitDiceResource')) {
			html.find('.hit-name').click(this._onResourceRoll.bind(this));
		}

		// Miscellaneous roll if the option is enabled
		if (game.settings.get('cthack', 'MiscellaneousResource')) {
			html.find('.miscellaneous-name').click(this._onResourceRoll.bind(this));
		}

		// Fortune option
		html.find('.fortune-use').click(this._onFortuneUse.bind(this));

		// Adrenaline option
		html.find('#adr1').click(this._onAdrenalineUse.bind(this));
		html.find('#adr2').click(this._onAdrenalineUse.bind(this));

		// Roll for item in inventory
		html.find('.fa-dice-d20').click(this._onMaterialRoll.bind(this));

		// Change item dice value in inventory
		html.find('.item-dice').change((ev) => {
			const li = $(ev.currentTarget).parents('.item');
			const item = this.actor.getOwnedItem(li.data('itemId'));
			const selectName = "[name='" + item._id + "']";
			const newValue = html.find(selectName)[0].value;
			const update = { _id: item._id, 'data.dice': newValue };
			this.actor.updateEmbeddedEntity('OwnedItem', update);
		});
	}

	/* -------------------------------------------- */

	/**
	 * @name _onItemCreate
	 * @description Callback on delete item actions
	 * 				Creates a new Owned Item for the actor using initial data defined in the HTML dataset
	 * @private
	 * 
	 * @param {Event} event   The originating click event
	 * 
	 */
	_onItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		// Get the type of item to create.
		const type = header.dataset.type;
		// Grab any data associated with this control.
		const data = duplicate(header.dataset);
		// Initialize a default name.
		const name = `New ${type.capitalize()}`;
		// Prepare the item object.
		const itemData = {
			name: name,
			type: type,
			data: data
		};
		// Remove the type from the dataset since it's in the itemData.type prop.
		delete itemData.data['type'];

		// Finally, create the item!
		return this.actor.createOwnedItem(itemData, { renderSheet: true });
	}

	/**
	 * @name _onItemDelete
	 * @description Callback on delete item actions
	 * 				The result depends on the data type
	 * @private
	 * 
	 * @param {Event} event   The originating click event
	 * 
	 */  
	async _onItemDelete(event) {
		event.preventDefault();
		const li = $(event.currentTarget).parents('.item');
		const itemId = li.data('itemId');
		const item = this.actor.items.find((item) => item._id === itemId);
		const key = item.data.data.key;
		li.slideUp(200, () => this.render(false));

		switch (item.data.type) {
			case 'item':
				return this.actor.deleteOwnedItem(itemId);
			case 'ability':
				this.actor.deleteAbility(key, itemId);
				return this.actor.deleteOwnedItem(itemId);
			case 'definition':
				await this.actor.deleteEffectFromItem(item);
				return this.actor.deleteOwnedItem(itemId);
			default:
				return this.actor.deleteOwnedItem(itemId);
		}
	}

	/**
	 * @name _onItemUse
	 * @description Callback on use item actions
	 * 				Only ability type is managed
	 * @private
	 * 
	 * @param {Event} event   The originating click event
	 * 
	 */  
	_onItemUse(event) {
		event.preventDefault();
		const li = $(event.currentTarget).parents('.item');
		const itemId = li.data('itemId');
		const entity = this.actor.items.find((item) => item._id === itemId);
		switch (entity.data.type) {
			case 'ability':
				return this._useAbility(entity);
			default:
				return;
		}
	}

	/**
	 * @name _useAbility
	 * @description 		Handles ability use
	 * 						Decreases the usage left by 1
	 * 						Display the time of the use
	 * @private
	 * 
	 * @param {*} ability   The ability item used
	 * 
	 */ 
	_useAbility(ability) {
		if (CONFIG.debug.cthack) console.log(`Use ability ${ability.name}`);
		let remaining = ability.data.data.uses.value;
		if (remaining > 0) {
			remaining--;
		}
		const now = new Date(); 
		const lastTime = formatDate(now);
		ability.update({ 'data.uses.value': remaining, 'data.uses.last': lastTime });
		this.actor.sheet.render(true);
	}

	/**
   * Reset ability use
   * @param event the roll event
   * @private
   */
	_onAbilityReset(event) {
		event.preventDefault();
		const li = $(event.currentTarget).parents('.item');
		const itemId = li.data('itemId');
		const item = this.actor.items.find((item) => item._id === itemId);

		if (CONFIG.debug.cthack) console.log(`Reset ability ${item.name}`);
		const maxUse = item.data.data.uses.max;
		item.update({ 'data.uses.value': maxUse, 'data.uses.last': '' });
	}

	/**
   * Handle clickable save roll
   * @param {Event} event   The originating click event
   * @private
   */
	_onSaveRoll(event) {
		event.preventDefault();
		let save = event.currentTarget.parentElement.dataset.save;
		this.actor.rollSave(save, { event: event });
	}

	/**
   * Handle clickable resource roll
   * @param {Event} event   The originating click event
   * @private
   */
	async _onResourceRoll(event) {
		event.preventDefault();
		let resource = event.currentTarget.dataset.resource;

		await this.actor.rollResource(resource, { event: event });
		
		this.actor.sheet.render(true);
	}

	/**
   * Handle clickable Material roll as a resource
   * @param {Event} event   The originating click event
   * @private
   */
	async _onMaterialRoll(event) {
		event.preventDefault();
		
		const li = $(event.currentTarget).parents('.item');
		const itemId = li.data('item-id');
		let item = this.actor.getOwnedItem(itemId);

		await this.actor.rollMaterial(item, { event: event });

		this.actor.sheet.render(true);
	}

	/**
   * Handle clickable Damaged roll.
   * @param {Event} event   The originating click event
   * @private
   */
	_onDamagedRoll(event) {
		event.preventDefault();
		const damage = event.currentTarget.dataset.resource;
		this.actor.rollDamageRoll(damage, { event: event });
	}

	/** @override */
	async _onDropItemCreate(itemData) {
		switch (itemData.type) {
			case 'archetype':
				return await this._onDropArchetypeItem(itemData);
			case 'ability':
				return await this._onDropAbilityItem(itemData);
			case 'attack':
			case 'item':
			case 'weapon':
				return await this._onDropStandardItem(itemData);
			case 'definition':
				return await this._onDropDefinitionItem(itemData);
			default:
				return;
		}
	}

	/**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {Object} data         The data transfer extracted from the event
   * @return {Object}             OwnedItem data to create
   * @private
   */
	async _onDropStandardItem(data) {
		if (!this.actor.owner) return false;

		const itemData = duplicate(data);

		// Create the owned item
		return this.actor.createEmbeddedEntity('OwnedItem', itemData, { renderSheet: true });
	}

	/**
   * Handle dropping of an item reference or item data of type definition onto an Actor Sheet
   * @param {Object} data         The data transfer extracted from the event
   * @return {Object}             OwnedItem data to create
   * @private
   */
	async _onDropDefinitionItem(data) {
		if (!this.actor.owner) return false;

		const itemData = duplicate(data);
		itemData.data.creationDate = formatDate(new Date());

		return this.actor.createDefinitionItem(itemData);
	}

	/**
   * Handle dropping of an archetype onto an Actor Sheet
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @private
   */
	_onDropArchetypeItem(itemData) {
		// Replace actor data
		this.actor.update({
			'data.archetype': itemData.name,
			'data.attributes.flashlights': { value: itemData.data.flashlights, max: itemData.data.flashlights },
			'data.attributes.smokes': { value: itemData.data.smokes, max: itemData.data.smokes },
			'data.attributes.sanity': { value: itemData.data.sanity, max: itemData.data.sanity },
			'data.attributes.hitDice': { value: itemData.data.hitdice },
			'data.attributes.wealthDice': { value: itemData.data.wealthDice },
			'data.attributes.armedDamage': { value: itemData.data.armeddamage },
			'data.attributes.unarmedDamage': { value: itemData.data.unarmeddamage }
		});
		this.actor.sheet.render(true);
	}

	/**
   * Handle dropping of an ability Item onto an Actor Sheet
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @private
   */
	_onDropAbilityItem(itemData) {
		const id = itemData._id;
		const key = itemData.data.key;
		const multiple = itemData.data.multiple;

		let abilitiesList = this.actor.data.data.abilities;

		if (multiple){
			if (!this._hasAbility(key, abilitiesList)){
				abilitiesList.push({ key: key, id: id });
				this.actor.update({ 'data.abilities': abilitiesList });
			}
			return this.actor.createEmbeddedEntity('OwnedItem', itemData, { renderSheet: true });
		}
		else {
			if (!this._hasAbility(key, abilitiesList)){
				abilitiesList.push({ key: key, id: id });
				this.actor.update({ 'data.abilities': abilitiesList });
				return this.actor.createEmbeddedEntity('OwnedItem', itemData, { renderSheet: true });
			}
			else return;
		}
	}

	/**
   * Check if the ability is already owned based on key
   * @param {String} key      The key to find
   * @param {String[]} abilitiesList   All owned abilities
   * @private
   */
	_hasAbility(key, abilitiesList) {
		for (let ability of abilitiesList) {
			if (key === ability.key) {
				return true;
			}
		}
		return false;
	}

/**
 * Reduce the Fortune value by 1 (GM only)
 * @param {Event} event   The originating click event
 * @private
*/
	_onFortuneUse(event) {
		event.preventDefault();
		if (game.user.isGM) {
			const currentValue = game.settings.get('cthack', 'FortuneValue');
			const newValue = currentValue - 1;

			if (currentValue > 0) {
				game.settings.set('cthack', 'FortuneValue', newValue);
				//this.actor.sheet.render(true);
				ChatMessage.create({
					user: game.user._id,
					//speaker: ChatMessage.getSpeaker({user: game.user}),
					content: game.i18n.format('CTHACK.FortuneUseMessage', { name: this.actor.name, total: newValue })
				  });
	
			}
					
			/*
			if (currentValue > 0) {
				const newValue = currentValue - 1;
				let data = {
					value: newValue
				};
				game.socket.emit("system.cthack", { msg: "msg_use_fortune", data: data});
			}
			*/
			
		}
	}

	/**
 * Toggle adrenaline 1 
 * @param {Event} event   The originating click event
 * @private
*/
	_onAdrenalineUse(event) {
		event.preventDefault();
		const adr = event.currentTarget.id;
		if (adr === 'adr1') {
			const value = this.actor.data.data.attributes.adrenaline1.value;
			let newData = { value: 'pj' };
			if (value === 'pj') {
				newData = { value: 'mj' };
			}
			this.actor.update({ 'data.attributes.adrenaline1': newData });
		} else if (adr === 'adr2') {
			const value = this.actor.data.data.attributes.adrenaline2.value;
			let newData = { value: 'pj' };
			if (value === 'pj') {
				newData = { value: 'mj' };
			}
			this.actor.update({ 'data.attributes.adrenaline2': newData });
		}
		this.actor.sheet.render(true);
	}

	/**
   * Handle toggling of an item from the Actor sheet
   * @private
   */
	_onItemSummary(event) {
		event.preventDefault();
		let li = $(event.currentTarget).parents('.item'),
			item = this.actor.getOwnedItem(li.data('item-id'));

		// Toggle summary
		if (item.data.data.description !== undefined && item.data.data.description !== null) {
			if (li.hasClass('expanded')) {
				let summary = li.children('.item-summary');
				summary.slideUp(200, () => summary.remove());
			} else {
				let div = $(`<div class="item-summary">${item.data.data.description}</div>`);
				li.append(div.hide());
				div.slideDown(200);
			}
			li.toggleClass('expanded');
		}
	}
}
