import CtHackItemSheet from "./item.mjs";

export default class CtHackObjetSheet extends CtHackItemSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      height: 250,
      width: 250,
      resizable: true,
    });
  }

  /**
   * The item type displayed in the sheet
   * @type {string}
   */
  static itemType = "item";
}
