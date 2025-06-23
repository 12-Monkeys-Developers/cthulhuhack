import constructHTMLButton from "../../utils/construct-html-button.mjs"

const { HandlebarsApplicationMixin } = foundry.applications.api

/**
 * Augments a Document Sheet with Cthulhu Hack specific behavior
 * @template {Constructor<foundry.applications.api.DocumentSheet>} BaseDocumentSheet
 * @param {BaseDocumentSheet} base
 */
export default (base) => {
  return class CtHackDocumentSheet extends HandlebarsApplicationMixin(base) {
    /** @inheritdoc */
    static DEFAULT_OPTIONS = {
      classes: ["cthack"],
      form: {
        submitOnChange: true,
        closeOnSubmit: false,
      },
      window: {
        resizable: true,
      },
    }

    /**
     * Available sheet modes.
     * @enum {number}
     */
    static MODES = Object.freeze({
      PLAY: 1,
      EDIT: 2,
    })

    /**
     * The mode the sheet is currently in.
     * @type {CtHackDocumentSheet.MODES}
     */
    _mode

    /**
     * Is this sheet in Play Mode?
     * @returns {boolean}
     */
    get isPlayMode() {
      return this._mode === CtHackDocumentSheet.MODES.PLAY
    }

    /**
     * Is this sheet in Edit Mode?
     * @returns {boolean}
     */
    get isEditMode() {
      return this._mode === CtHackDocumentSheet.MODES.EDIT
    }

    /** @inheritdoc */
    _configureRenderOptions(options) {
      super._configureRenderOptions(options)
      if (options.mode && this.isEditable) this._mode = options.mode
    }

    /** @inheritdoc */
    async _renderFrame(options) {
      const frame = await super._renderFrame(options)
      const buttons = [
        constructHTMLButton({ label: "", classes: ["header-control", "icon", "fa-solid", "fa-user-lock"], dataset: { action: "toggleMode", tooltip: "CTHACK.ToggleMode" } }),
      ]
      this.window.controls.after(...buttons)
      return frame
    }

    /** @inheritdoc */
    async _prepareContext(options) {
      const context = await super._prepareContext(options)
      Object.assign(context, {
        isPlay: this.isPlayMode,
        isEdit: this.isEditMode,
        editable: this.isEditable,
        owner: this.document.isOwner,
        limited: this.document.limited,
        gm: game.user.isGM,
        document: this.document,
        system: this.document.system,
        systemSource: this.document.system._source,
        systemFields: this.document.system.schema.fields,
        source: this.document.toObject(),
        fields: this.document.schema.fields,
        flags: this.document.flags,
        config: game.system.CONST
      })
      return context
    }
  }
}
