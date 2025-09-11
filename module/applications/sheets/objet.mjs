import CtHackItemSheet from "./item.mjs"

export default class CtHackObjetSheet extends CtHackItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["object"],
    window: {
      contentClasses: ["object-content"],
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/cthack/templates/sheets/item.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    context.useSize = game.settings.get("cthack", "useSize")
    context.hasSizeUnequipped = this.document.system.hasSizeUnequipped()
    context.hasDefaultImage = this.document.system.hasDefaultImage()
    return context
  }
}
