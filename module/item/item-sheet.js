/**
 * Standard Item Sheet
 * @extends {ItemSheet}
 */
export class CtHackItemSheet extends ItemSheet {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: [ 'cthack', 'sheet', 'item' ],
			width: 520,
			height: 580,
			tabs: [ { navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description' } ]
		});
	}

	/** @override */
	get template() {
		return `systems/cthack/templates/item/${this.item.type}-sheet.hbs`;
	}

	/** @override */
	async getData(options) {
		const context = super.getData(options);

		context.enrichedDescription = await TextEditor.enrichHTML(this.object.system.description, {async: true});

		return context;
	}

	/** @override
	setPosition(options = {}) {
		const position = super.setPosition(options);
		const sheetBody = this.element.find('.sheet-body');
		const bodyHeight = position.height - 52;
		sheetBody.css('height', bodyHeight);
		return position;
	} */

}
