/**
 * Standard Item Sheet
 * @extends {ItemSheet}
 */
export class CtHackItemSheet extends ItemSheet {
	/** @override */
	static get defaultOptions() {
		let width = 520;
		let height = 580;
		let tabs = [ { navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description' } ];
		return mergeObject(super.defaultOptions, {
			classes: [ 'cthack', 'sheet', 'item' ],
			width: width,
			height: height,
			tabs: tabs
		});
	}

	/** @override */
	get template() {
		const path = 'systems/cthack/templates/item';
		return `${path}/${this.item.data.type}-sheet.html`;
	}

	/* -------------------------------------------- */

	/** @override */
	getData() {
		const data = super.getData();
		return data;
	}

	/* -------------------------------------------- */

	/** @override */
	setPosition(options = {}) {
		const position = super.setPosition(options);
		const sheetBody = this.element.find('.sheet-body');
		//const bodyHeight = position.height - 192;
		const bodyHeight = position.height - 52;
		sheetBody.css('height', bodyHeight);
		return position;
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
