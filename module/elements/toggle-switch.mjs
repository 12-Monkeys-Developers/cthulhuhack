import { CheckboxElement } from "./_module.mjs"

/**
 * A custom HTML element that represents a checkbox-like input that is displayed as a slide toggle.
 * @fires change
 */
export default class ToggleSwitchElement extends CheckboxElement {
  /** @override */
  static tagName = "cthack-toggle-switch"

  /** @override */
  static useShadowRoot = false

  /** @inheritDoc */
  constructor() {
    super()
    this._internals.role = "switch"
  }

  /**
   * Activate the element when it is attached to the DOM.
   * @inheritDoc
   */
  connectedCallback() {
    this.replaceChildren(...this._buildElements())
    this._refresh()
    this._activateListeners()
  }

  /**
   * Create the constituent components of this element.
   * @returns {HTMLElement[]}
   * @protected
   */
  _buildElements() {
    const track = document.createElement("track")
    //track.classList.add("track")
    const thumb = document.createElement("thumb")
    //thumb.classList.add("thumb")
    track.append(thumb)
    return [track]
  }
}
