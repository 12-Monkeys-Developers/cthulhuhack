/**
 * Standard Magic Sheet
 * @extends {ItemSheet}
 */
export class CtHackMagicSheet extends ItemSheet {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: [ 'cthack', 'sheet', 'item', 'magic' ],
			width: 400,
			height: 400
		});
	}

	/** @override */
	get template() {
		const path = 'systems/cthack/templates/item';
		return `${path}/${this.item.type}-sheet.hbs`;
	}

	/** @override */
	async getData(options) {
		const context = super.getData(options);

		console.log("context", context);

		context.enrichedDescription = await TextEditor.enrichHTML(context.item.system.description, {async: true});

		return context;
	}

}
