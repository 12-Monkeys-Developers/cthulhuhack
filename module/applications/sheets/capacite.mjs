import CtHackItemSheet from "./item.mjs"

export default class CtHackCapaciteSheet extends CtHackItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["ability"],
    position: {
      width: 800,
    },
    window: {
      contentClasses: ["ability-content"],
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
    context.hasDefaultImage = this.document.system.hasDefaultImage()
    return context
  }
}
