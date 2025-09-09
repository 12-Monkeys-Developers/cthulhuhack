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


    /** @inheritdoc 
    _configureRenderOptions(options) {
      super._configureRenderOptions(options)
      if (options.mode && this.isEditable) this._mode = options.mode
    }*/

    /** @override */
    async _onRender(context, options) {
      await super._onRender(context, options)
      const editableImage = this.element.querySelector(".editable-image")
      if (editableImage) {
        editableImage.addEventListener("contextmenu", (event) => {
          CtHackDocumentSheet.#onResetImage(event, editableImage)
        })
      }
    }
    

    /** @inheritdoc */
    async _prepareContext(options) {
      // super context : document, editable, fields, rootId, source, user
      const context = await super._prepareContext(options)
      Object.assign(context, {
        isPlay: this.isPlayMode,
        isEdit: this.isEditMode,
        owner: this.document.isOwner,
        limited: this.document.limited,
        gm: game.user.isGM,
        system: this.document.system,
        systemSource: this.document.system._source,
        systemFields: this.document.system.schema.fields,
        flags: this.document.flags,
        config: game.system.CONST,
      })
      return context
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
}
