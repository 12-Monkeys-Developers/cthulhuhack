export default class CtHackItemSheet extends ItemSheet {
  /** @inheritdoc */
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      width: 400,
      height: 800,
      classes: ["cthack", "sheet", "item", this.itemType],
      template: `systems/cthack/templates/sheets/${this.itemType}.hbs`,
      resizable: false,
      tabs: [],
      scrollY: [],
    });
  }

  /** @override */
  get isEditable() {
    return super.isEditable && this.item.isUnlocked;
  }

  /** @override */
  async getData(options) {
    const context = super.getData(options);
    // By using isEditable, it will allow the automatic configuration to disabled on all input, select and textarea
    context.editable = this.isEditable;
    context.enrichedDescription = await TextEditor.enrichHTML(context.item.system.description, { async: true });
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".sheet-lock").click(this._onSheetLock.bind(this));
    html.find(".editable-image").on("contextmenu", this._resetImage.bind(this));
  }

  /**
   * Lock or unlock the sheet
   * @param {*} event
   */
  async _onSheetLock(event) {
    event.preventDefault();
    await this.item.update({ "system.locked": !this.item.system.locked });
    this.render(true);
  }

  /**
   * Resets the image of the opponent sheet.
   * @param {Event} event - The event object.
   * @returns {Promise<void>} - A promise that resolves when the image is reset.
   */
  async _resetImage(event) {
    event.preventDefault();
    if (this.item.type === "magic") await this.item.update({ img: "/systems/cthack/ui/icons/spell-book.png" });
    else await this.item.update({ img: "icons/svg/item-bag.svg"});
  }
}
