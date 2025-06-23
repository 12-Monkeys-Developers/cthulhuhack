import CtHackItemSheetV2 from "./item.mjs"

export default class CtHackArchetypeSheetV2 extends CtHackItemSheetV2 {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["archetype"],
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
      template: "systems/cthack/templates/v2/archetype.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    context.diceDamageValues = SYSTEM.DICE_DAMAGE_VALUES
    context.wealthStart = SYSTEM.WEALTH_START
    context.saves = SYSTEM.SAVES
    return context
  }
}
