import CtHackItemSheetV2 from "./item.mjs"

export default class CtHackAdversaireCapaciteSheetV2 extends CtHackItemSheetV2 {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["adversaire-capacite"],
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
      template: "systems/cthack/templates/v2/opponent-ability.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    context.usage = SYSTEM.ABILITY_
    return context
  }
}
