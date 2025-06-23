import { CtHackDocumentSheetMixin } from "../../api/_module.mjs"

const { sheets, ux } = foundry.applications

export default class CtHackItemSheetV2 extends CtHackDocumentSheetMixin(sheets.ItemSheetV2) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["item"],
    position: {
      width: 400,
      height: 800,
    },
    actions: {
      toggleSheetLock: CtHackItemSheetV2.#onToggleSheetLock,
      toggleMode: CtHackItemSheetV2.#toggleMode,
      editImage: CtHackItemSheetV2.#onEditImage,
      resetImage: CtHackItemSheetV2.#onResetImage,
    },
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options)
    const editableImage = this.element.querySelector(".editable-image")
    if (editableImage) {
      editableImage.addEventListener("contextmenu", (event) => {
        CtHackItemSheetV2.#onResetImage(event, editableImage)
      })
    }
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options)

    Object.assign(context, {
      item: this.document,
      enrichedDescription: await ux.TextEditor.implementation.enrichHTML(this.document.system.description, { async: true }),
      diceValues: SYSTEM.DICE_VALUES,
      diceMaxValues: SYSTEM.DICE_MAX_VALUES,
      diceDamageValues: SYSTEM.DICE_DAMAGE_VALUES,
    })
    return context
  }

  /**
   * Toggle Edit vs. Play mode
   *
   * @this CtHackItemSheetV2
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   */
  static async #toggleMode(event, target) {
    if (!this.isEditable) {
      console.error("You can't switch to Edit mode if the sheet is uneditable")
      return
    }
    this._mode = this.isPlayMode ? CtHackItemSheetV2.MODES.EDIT : CtHackItemSheetV2.MODES.PLAY
    this.render()
  }

  /**
   * Handle toggling between Edit and Play mode.
   * @param {Event} event             The initiating click event.
   * @param {HTMLElement} target      The current target of the event listener.
   */
  static async #onToggleSheetLock(event, target) {
    event.preventDefault()
    await this.item.update({ "system.locked": !this.item.system.locked })
    this.render({ force: true })
  }

  /**
   * Handle changing a Document's image.
   *
   * @this TenebrisCharacterSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @returns {Promise}
   * @private
   */
  static async #onEditImage(event, target) {
    const attr = target.dataset.edit
    const current = foundry.utils.getProperty(this.document, attr)
    const { img } = this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ?? {}
    const fp = new foundry.applications.apps.FilePicker.implementation({
      current,
      type: "image",
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        this.document.update({ [attr]: path })
      },
      top: this.position.top + 40,
      left: this.position.left + 10,
    })
    return fp.browse()
  }

  /**
   * Resets the image of the opponent sheet.
   * @param {Event} event             The initiating click event.
   * @param {HTMLElement} target      The current target of the event listener.
   */
  static async #onResetImage(event, target) {
    event.preventDefault()
    const dataset = target.dataset
    if (!dataset) return
    const uuid = dataset.uuid
    if (!uuid) return
    const item = fromUuidSync(uuid)
    if (!item) return
    if (item.type === "magic") await item.update({ img: "/systems/cthack/ui/icons/spell-book.png" })
    else await item.update({ img: "icons/svg/item-bag.svg" })
  }
}
