/**
 * Archetype Sheet
 * @extends {ItemSheet}
 */
export class CtHackArchetypeSheet extends ItemSheet {
	/** @override */
	static get defaultOptions() {
		let width = 600;
		let height = 860;
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: [ 'cthack', 'sheet', 'item', 'sheet-archetype' ],
			width: width,
			height: height
		});
	}

	/** @override */
	get template() {
		return "systems/cthack/templates/item/archetype-sheet.hbs";
	}

	/** @override */
	getData(options) {
		const context = super.getData(options);
		return context;
	}

}
