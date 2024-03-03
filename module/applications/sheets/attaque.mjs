import CtHackItemSheet from "./item.mjs";

export default class CtHackAttaqueSheet extends CtHackItemSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return Object.assign(options, {
      height: 300,
      width: 300,
      resizable: true,
    });
  }
  /**
   * The item type displayed in the sheet
   * @type {string}
   */
  static itemType = "attack";

    /** @override */
    async getData(options) {
      const context = await super.getData(options);
      context.dicesDamage = SYSTEM.ATTACK_DAMAGE_DICE;
      return context;
    }
}
