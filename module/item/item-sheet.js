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
		return `${path}/${this.item.type}-sheet.hbs`;
	}

	/** @override */
	getData(options) {
		const context = super.getData(options);
		return context;
	}

	/** @override */
	setPosition(options = {}) {
		const position = super.setPosition(options);
		const sheetBody = this.element.find('.sheet-body');
		const bodyHeight = position.height - 52;
		sheetBody.css('height', bodyHeight);
		return position;
	}

}
