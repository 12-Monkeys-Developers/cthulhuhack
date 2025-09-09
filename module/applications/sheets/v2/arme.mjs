import CtHackItemSheetV2 from "./item.mjs"

export default class CtHackArmeSheetV2 extends CtHackItemSheetV2 {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["weapon"],
    window: {      
      contentClasses: ["weapon-content"]
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/cthack/templates/v2/weapon.hbs",
    },
  }

  /** @override 
  _onRender(context, options) {
    super._onRender(context, options)
    const range = this.element.querySelector(".select-range")
    if (range) {
      range.addEventListener("change", (event) => {
        console.log("Range changed:", event.target.value)
        this.document.update({
          "system.range": event.target.value,
        })
      })
    }
  }*/

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    //context.diceWidget = this.#diceWidget.bind(this)
    context.rangeValues = SYSTEM.RANGE
    context.useSize = game.settings.get("cthack", "useSize")
    context.hasSizeUnequipped = this.document.system.hasSizeUnequipped()
    context.hasDefaultImage = this.document.system.hasDefaultImage()

    console.log("Context arme:", context)
    return context
  }

  /**
   * Render the Dice field as a choice between Dice values.
   * @returns {HTMLDivElement}
  
  #diceWidget(field, _groupConfig, inputConfig) {
    // Create the form field
    const fg = document.createElement("div")
    fg.className = "form-group"
    const ff = fg.appendChild(document.createElement("div"))
    ff.className = "form-fields"

    // Create the options for the select input
    const options = Object.entries(SYSTEM.DICE_VALUES).map(([key, value]) => ({ value: key, label: value }))
    const input = foundry.applications.fields.createSelectInput({ ...inputConfig, name: field.fieldPath, options, blank: "CTHACK.None", sort: true })
    let diceClass
    if (inputConfig?.value !== undefined) {
      if (inputConfig?.value === "" || inputConfig?.value === "0" || inputConfig?.value === "1") {
        diceClass = "dice-0"
      } else {
        diceClass = `dice-${inputConfig.value}`
      }
    }
    if (diceClass) input.classList.add(diceClass)

    ff.appendChild(input)

    return fg
  } */
}
