import CtHackItemSheetV2 from "./item.mjs"

export default class CtHackCapaciteSheetV2 extends CtHackItemSheetV2(sheets.ItemSheet) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["weapon"],
    position: {
      height: 600,
      width: 800,
    },
    window: {
      contentClasses: ["standard-form"],
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/cthack/templates/v2/ability.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    context.usage = SYSTEM.ABILITY_USAGE
    return context
  }
}
