/**
 * Archetype Sheet
 * @extends {ItemSheet}
 */
export class CtHackArchetypeSheet extends ItemSheet {
	/** @override */
	static get defaultOptions() {
		let width = 600;
		let height = 860;
		return mergeObject(super.defaultOptions, {
			classes: [ 'cthack', 'sheet', 'item', 'sheet-archetype' ],
			width: width,
			height: height
		});
	}

	/** @override */
	get template() {
		return "systems/cthack/templates/item/archetype-sheet.hbs";
	}

	/* -------------------------------------------- */

	/** @override */
	getData() {
		const data = super.getData();
		return data;
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		// Roll handlers, click handlers, etc. would go here.
	}
}
