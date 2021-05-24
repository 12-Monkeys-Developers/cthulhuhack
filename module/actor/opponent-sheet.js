/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CtHackOpponentSheet extends ActorSheet {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: [ 'cthack', 'sheet', 'actor', 'opponent' ],
			width: 650,
			height: 430,
			tabs: [ { navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description' } ],
			dragDrop: [{ dragSelector: ".items-list .item", dropSelector: null }]
		});
	}

	/* -------------------------------------------- */

	/** @override */
	get template() {
		return 'systems/cthack/templates/actor/opponent-sheet.hbs';
	}

	/** @override */
	getData(options) {
		const context = super.getData(options);
		context.opponentData = context.data;
		context.systemData = context.opponentData.data;

		context.attacks = context.items.filter(function(item) {	return item.type === 'attack'; });

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

		html.find('.selectHitDice').change((ev) => {
			const newValue = 4 * ev.currentTarget.value;
			this.actor.update({
				'data.hp': { max: newValue }
			});
			this.actor.sheet.render(true);
		});

		// Roll for item in inventory
		html.find('.fa-dice-d20').click(this._onAttackDamageRoll.bind(this));
	}

	/**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
  */
	_onAttackCreate(event) {
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

	/**
   * Handle clickable Damaged roll.
   * @param {Event} event   The originating click event
   * @private
   */
	_onAttackDamageRoll(event) {
		/*


		event.preventDefault();
		const dice = event.currentTarget.parentElement.childNodes[1].nodeValue;
		this.actor.rollAttackDamageRoll(dice, { event: event });
		*/
		const li = $(event.currentTarget).parents('.item');
		const itemId = li.data('itemId');
		let item = this.actor.items.get(itemId);

		this.actor.rollAttackDamageRoll(item, { event: event });
	}
}
