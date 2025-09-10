import CtHackItemSheet from "./item.mjs"

export default class CtHackAttaqueSheet extends CtHackItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["attack"],
    position: {
      width: 800,
    },
    window: {
      contentClasses: ["attack-content"],
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/cthack/templates/v2/attack.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    context.hasDefaultImage = this.document.system.hasDefaultImage()
    return context
  }
}
