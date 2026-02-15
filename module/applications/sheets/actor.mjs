import { CtHackDocumentSheetMixin } from "../api/_module.mjs"
import { SearchChat } from "../research.mjs"

const { sheets, ux } = foundry.applications

export default class CtHackActorSheet extends CtHackDocumentSheetMixin(sheets.ActorSheetV2) {
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
    return this._sheetMode === CtHackActorSheet.SHEET_MODES.PLAY
  }

  /**
   * Is this sheet in Edit Mode?
   * @returns {boolean}
   */
  get isEditMode() {
    return this._sheetMode === CtHackActorSheet.SHEET_MODES.EDIT
  }

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["actor"],
    position: {
      width: 600,
      height: 500,
    },
    form: {
      submitOnChange: true,
    },
    actions: {
      editImage: CtHackActorSheet.#onEditImage,
      shareImage: CtHackActorSheet.#onShareImage,
      searchName: CtHackActorSheet.#onSearchName,
    },
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options)
    this._renderModeToggle(this.element)
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options)

    Object.assign(context, {
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
      systemSource: this.document.system._source,
      actor: this.document,
      system: this.document.system,
      source: this.document.toObject(),
      hasImage: this.document.hasImage,
      diceValues: SYSTEM.DICE_VALUES,
      diceMaxValues: SYSTEM.DICE_MAX_VALUES,
      diceDamageValues: SYSTEM.DICE_DAMAGE_VALUES,
    })
    return context
  }

  /**
   * Handle changing a Document's image.
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
   * Handle sharing an image via ImagePopout.
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   */
  static #onShareImage(event, target) {
    const imagePath = target.dataset.image
    const name = target.dataset.name
    const ip = new ImagePopout(imagePath, { title: name })
    ip.render(true)
  }

  /**
   * Handle searching for an actor name in the world.
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   */
  static async #onSearchName(event, target) {
    const name = target.dataset.name
    let search = await new SearchChat().create(name)
    await search.searchWorld()
    await search.display()
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
