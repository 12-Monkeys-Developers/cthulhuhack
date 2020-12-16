/**
 * Archetype Sheet
 * @extends {ItemSheet}
 */
export class CtHackArchetypeSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    let width = 590;
    let height = 830;
    return mergeObject(super.defaultOptions, {
      classes: ["cthack", "sheet", "item", "sheet-archetype"],
      width: width,
      height: height
    });
  }

  /** @override */
  get template() {
    const path = "systems/cthack/templates/item";
    return `${path}/archetype-sheet.html`;
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
