import CtHackItemSheet from "./item.mjs";

export default class CtHackArmeSheet extends CtHackItemSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      height: 300,
      width: 400,
      resizable: true,
    });
  }
  /**
   * The item type displayed in the sheet
   * @type {string}
   */
  static itemType = "weapon";
}
