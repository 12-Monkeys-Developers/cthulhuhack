import CtHackItemSheet from "./item.mjs";

export default class CtHackMagieSheet extends CtHackItemSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      height: 400,
      width: 400,
      resizable: true,
    });
  }
  /**
   * The item type displayed in the sheet
   * @type {string}
   */
  static itemType = "magic";

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    context.magicTypes = SYSTEM.MAGIC_TYPE;
    return context;
  }
}
