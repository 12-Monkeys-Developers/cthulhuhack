import CtHackItemSheet from "./item.mjs";

export default class CtHackAdversaireCapaciteSheet extends CtHackItemSheet {
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
  static itemType = "opponentAbility";

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    context.usage = SYSTEM.ABILITY_USAGE;
    return context;
  }
}
