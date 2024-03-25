import { SYSTEM } from "../../config/system.mjs";
import CtHackItemSheet from "./item.mjs";

export default class CtHackArchetypeSheet extends CtHackItemSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      height: 600,
      width: 800,
      resizable: true,
    });
  }
  /**
   * The item type displayed in the sheet
   * @type {string}
   */
  static itemType = "archetype";

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    context.diceDamageValues = SYSTEM.DICE_DAMAGE_VALUES;
    context.wealthStart = SYSTEM.WEALTH_START;
    context.saves = SYSTEM.SAVES;
    return context;
  }
}
