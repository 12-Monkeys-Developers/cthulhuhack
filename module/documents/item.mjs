/**
 * @extends {Item}
 */
export default class CtHackItem extends Item {
  static DEFAULT_ICON_MAGIC = "/systems/cthack/ui/icons/spell-book.png";
  static DEFAULT_ICON = "icons/svg/item-bag.svg";

  async _preUpdate(changed, options, user) {
    await super._preUpdate(changed, options, user)

    // For abilitiy items, sets the defalut value for the "key" field.
    if (this.type === "ability") {      
      this.updateSource({ "system.key": this.name.slugify() })
    }
  }

  /** override */
  static getDefaultArtwork(itemData) {
    if (itemData.type === "magic") {
      return { img: this.DEFAULT_ICON_MAGIC };
    }
    return { img: this.DEFAULT_ICON };
  }

  /**
   * Checks if the item is unlocked.
   *
   * @returns {boolean} Returns true if the item is unlocked, false otherwise.
   */
  get isUnlocked() {
    return !this.system.locked;
  }

  /**
   * Checks if the item has an image.
   * @returns {boolean} Returns true if the item has an image, false otherwise.
   */
  get hasImage(){
    if (this.type === "magic") return this.img && this.img !== CtHackItem.DEFAULT_ICON_MAGIC; 
    else return this.img && this.img !== CtHackItem.DEFAULT_ICON;
  }
}
