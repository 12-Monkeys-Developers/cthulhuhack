import CtHackItemSheet from "./item.mjs"

export default class CtHackAdversaireCapaciteSheet extends CtHackItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["opponent-ability"],
    window: {
      contentClasses: ["opponent-ability-content"],
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/cthack/templates/sheets/opponent-ability.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    context.usage = SYSTEM.ABILITY_USAGE
    context.hasDefaultImage = this.document.system.hasDefaultImage()
    return context
  }
}
