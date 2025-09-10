import CtHackItemSheet from "./item.mjs"

export default class CtHackDefinitionSheet extends CtHackItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["definition"],
    position: {
      height: 200,
    },
    window: {
      contentClasses: ["definition-content"],
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/cthack/templates/v2/definition.hbs",
    },
  }

    /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()  
    context.hasDefaultImage = this.document.system.hasDefaultImage()
    return context
  }
}
