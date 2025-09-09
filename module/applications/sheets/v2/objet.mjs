import CtHackItemSheetV2 from "./item.mjs"

export default class CtHackObjetSheetV2 extends CtHackItemSheetV2 {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["object"],
    position: {
      height: 250,
      width: 250,
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/cthack/templates/v2/item.hbs",
    },
  }
}