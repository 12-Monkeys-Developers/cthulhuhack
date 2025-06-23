import CtHackItemSheetV2 from "./item.mjs"

export default class CtHackDefinitionSheetV2 extends CtHackItemSheetV2 {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["definition"],
    position: {
      height: 300,
      width: 400,
    },
    window: {
      contentClasses: ["standard-form"],
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/cthack/templates/v2/definition.hbs",
    },
  }
}