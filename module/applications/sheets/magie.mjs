import CtHackItemSheet from "./item.mjs"

export default class CtHackMagieSheet extends CtHackItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["magic"],
    window: {
      contentClasses: ["magic-content"],
    },
    position: {
      height: 500,
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/cthack/templates/sheets/magic.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    context.magicTypes = SYSTEM.MAGIC_TYPE
    context.hasDefaultImage = this.document.system.hasDefaultImage()
    return context
  }
}
