import CtHackItemSheet from "./item.mjs"

export default class CtHackArchetypeSheet extends CtHackItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["archetype"],
    position: {
      width: 800,
    },
    window: {      
      contentClasses: ["archetype-content"]
    }
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/cthack/templates/sheets/archetype.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    context.wealthStart = SYSTEM.WEALTH_START
    return context
  }
}
