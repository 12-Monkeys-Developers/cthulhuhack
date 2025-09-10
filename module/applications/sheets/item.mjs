import { CtHackDocumentSheetMixin } from "../api/_module.mjs"

const { sheets, ux } = foundry.applications

export default class CtHackItemSheet extends CtHackDocumentSheetMixin(sheets.ItemSheetV2) {
  /**
   * Different sheet modes.
   * @enum {number}
   */
  static SHEET_MODES = Object.freeze({
    EDIT: 0,
    PLAY: 1,
  })

  /**
   * The current sheet mode.
   * @type {number}
   */
  _sheetMode = this.constructor.SHEET_MODES.PLAY

  /**
   * Is this sheet in Play Mode?
   * @returns {boolean}
   */
  get isPlayMode() {
    return this._sheetMode === CtHackItemSheet.SHEET_MODES.PLAY
  }

  /**
   * Is this sheet in Edit Mode?
   * @returns {boolean}
   */
  get isEditMode() {
    return this._sheetMode === CtHackItemSheet.SHEET_MODES.EDIT
  }

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["item"],
    position: {
      width: 400,
      height: "auto",
    },
    actions: {
      editImage: CtHackItemSheet.#onEditImage,
    },
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options)

    // Set toggle state and add status class to frame
    this._renderModeToggle(this.element)
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
   * Manage the lock/unlock button on the sheet
   * @param {Event} event
   */
  async _onSheetChangeLock(event) {
    event.preventDefault()
    const modes = this.constructor.SHEET_MODES
    this._sheetMode = this.isEditMode ? modes.PLAY : modes.EDIT
    await this.submit()
    this.render()
  }

  /**
   * Handle re-rendering the mode toggle on ownership changes.
   * @param {HTMLElement} element
   * @protected
   */
  _renderModeToggle(element) {
    const header = element.querySelector(".window-header")
    const toggle = header.querySelector(".mode-slider")
    if (this.isEditable && !toggle) {
      const toggle = document.createElement("cthack-toggle-switch")
      toggle.checked = this._sheetMode === this.constructor.SHEET_MODES.EDIT
      toggle.classList.add("mode-slider")
      toggle.dataset.tooltip = "CTHACK.SheetModeEdit"
      toggle.dataset.tooltipDirection = "UP"
      toggle.setAttribute("aria-label", game.i18n.localize("CTHACK.SheetModeEdit"))
      toggle.addEventListener("change", this._onSheetChangeLock.bind(this))
      toggle.addEventListener("dblclick", (event) => event.stopPropagation())
      toggle.addEventListener("pointerdown", (event) => event.stopPropagation())
      header.prepend(toggle)
    } else if (this.isEditable) {
      toggle.checked = this._sheetMode === this.constructor.SHEET_MODES.EDIT
    } else if (!this.isEditable && toggle) {
      toggle.remove()
    }
  }
}
