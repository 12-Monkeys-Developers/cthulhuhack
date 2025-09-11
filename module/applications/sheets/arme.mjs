import CtHackItemSheet from "./item.mjs"

export default class CtHackArmeSheet extends CtHackItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["weapon"],
    window: {
      contentClasses: ["weapon-content"],
    },
    position: {
      height: 500,
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/cthack/templates/sheets/weapon.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    context.rangeValues = SYSTEM.RANGE
    context.useSize = game.settings.get("cthack", "useSize")
    context.hasSizeUnequipped = this.document.system.hasSizeUnequipped()
    context.hasDefaultImage = this.document.system.hasDefaultImage()
    return context
  }
}
