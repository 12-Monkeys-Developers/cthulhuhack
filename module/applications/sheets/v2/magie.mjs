import CtHackItemSheetV2 from "./item.mjs"

export default class CtHackMagieSheetV2 extends CtHackItemSheetV2 {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["magic"],
    position: {
      height: 400,
      width: 400,
    },
  }

   /** @override */
  static PARTS = {
    main: {
      template: "systems/cthack/templates/v2/magic.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    context.magicTypes = SYSTEM.MAGIC_TYPE;
    return context
  }
}
