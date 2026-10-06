/**
 * @extends {Item}
 */
export default class CtHackItem extends Item {
  static DEFAULT_ICON_MAGIC = "/systems/cthack/ui/icons/spell-book.png"
  static DEFAULT_ICON = "icons/svg/item-bag.svg"

  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user)
    if (allowed === false) return false

    // La clé d'une capacité custom est le nom en slug
    if (this.type === "ability" && this.system.isCustom) {
      this.updateSource({ "system.key": this.name.slugify() })
    }
  }

  async _preUpdate(changed, options, user) {
    const allowed = await super._preUpdate(changed, options, user)
    if (allowed === false) return false

    // La clé d'une capacité custom suit le nom : écrite dans la requête pour être enregistrée
    if (this.type !== "ability") return
    const isCustom = foundry.utils.getProperty(changed, "system.isCustom") ?? this.system.isCustom
    if (isCustom) {
      foundry.utils.setProperty(changed, "system.key", (changed.name ?? this.name).slugify())
    }
  }

  /** override */
  static getDefaultArtwork(itemData) {
    if (itemData.type === "magic") {
      return { img: this.DEFAULT_ICON_MAGIC }
    }
    return { img: this.DEFAULT_ICON }
  }

  /**
   * Checks if the item is unlocked.
   *
   * @returns {boolean} Returns true if the item is unlocked, false otherwise.
   */
  get isUnlocked() {
    return !this.system.locked
  }

  /**
   * Checks if the item has an image.
   * @returns {boolean} Returns true if the item has an image, false otherwise.
   */
  get hasImage() {
    if (this.type === "magic") return this.img && this.img !== CtHackItem.DEFAULT_ICON_MAGIC
    else return this.img && this.img !== CtHackItem.DEFAULT_ICON
  }
}
