/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CtHackOpponentSheet extends ActorSheet {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: [ 'cthack', 'sheet', 'actor', 'opponent' ],
			width: 700,
			height: 480,
			dragDrop: [{ dragSelector: ".items-list .item", dropSelector: null }]
		});
	}

	/* -------------------------------------------- */

	/** @override */
	get template() {
		return 'systems/cthack/templates/actor/opponent-sheet.hbs';
	}

	/** @override */
	async getData(options) {
		const context = super.getData(options);
	
		context.attacks = context.items.filter(function(item) {	return item.type === 'attack'; });
		context.enrichedDescription = await TextEditor.enrichHTML(this.object.system.description, {async: true});

		return context;
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		// Item summaries
		html.find('.item .item-name h4').click((event) => this._onItemSummary(event));

		html.find('.attack-create').click(this._onAttackCreate.bind(this));

		html.find('.attack-edit').click((ev) => {
			const li = $(ev.currentTarget).parents('.item');
			const item = this.actor.items.get(li.data('itemId'));
			item.sheet.render(true);
		});

		html.find('.attack-delete').click(this._onAttackDelete.bind(this));

		html.find('.selectHitDice').change(this._onChangeHitDice.bind(this));

		// Roll for item in inventory
		html.find('.fa-dice-d20').click(this._onAttackDamageRoll.bind(this));
	}


	/**
	 * Handles the change on the HitDice value
	 * @param {*} event The originating change event
	 */
	async _onChangeHitDice(event) {
		const newHitDiceValue = parseInt(event.currentTarget.value);		
		const newHpMax = 4 * newHitDiceValue;
		const newArmorMalusValue = -1 * (newHitDiceValue - 1);
		await this.actor.update({
			'system.hitDice': newHitDiceValue,
			'system.hp.value': newHpMax,
			'system.hp.max': newHpMax,
			'system.malus': newArmorMalusValue
		})
		this.actor.sheet.render(true);
	}

	/**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
  */
	async _onAttackCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		// Get the type of item to create.
		const type = header.dataset.type;
		// Initialize a default name.
		const name = game.i18n.format("CTHACK.ItemNew", {type: game.i18n.localize(`CTHACK.ItemType${type.capitalize()}`)});
		// Prepare the item object.
		const itemData = {
			name: name,
			type: type
		};
		// Finally, create the item!
		return await this.actor.createEmbeddedDocuments('Item', [itemData], { renderSheet: true });
	}

	/**
   * Handle deleting a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
  */
	_onAttackDelete(event) {
		event.preventDefault();
		const li = $(event.currentTarget).parents('.item');
		const itemId = li.data('itemId');
		li.slideUp(200, () => this.render(false));
		return this.actor.deleteEmbeddedDocuments("Item",[itemId]);
	}

	/**
   * Handle toggling of an item from the Opponent sheet
   * @private
   */
	_onItemSummary(event) {
		event.preventDefault();
		let li = $(event.currentTarget).parents('.item'),
			item = this.actor.items.get(li.data('item-id'));

		// Toggle summary
		if (item.system.description !== undefined && item.system.description !== null) {
			if (li.hasClass('expanded')) {
				let summary = li.children('.item-summary');
				summary.slideUp(200, () => summary.remove());
			} else {
				let div = $(`<div class="item-summary">${item.system.description}</div>`);
				li.append(div.hide());
				div.slideDown(200);
			}
			li.toggleClass('expanded');
		}
	}

	/**
   * Handle clickable Damaged roll.
   * @param {Event} event   The originating click event
   * @private
   */
	_onAttackDamageRoll(event) {
		const li = $(event.currentTarget).parents('.item');
		const itemId = li.data('itemId');
		let item = this.actor.items.get(itemId);

		this.actor.rollAttackDamageRoll(item, { event: event });
	}
}
