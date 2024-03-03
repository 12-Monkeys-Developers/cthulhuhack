/**
 * @extends {Item}
 */
export class CtHackItem extends Item {
  static DEFAULT_ICON_MAGIC = "/systems/cthack/ui/icons/spell-book.png";

  /** override */
  static getDefaultArtwork(itemData) {
    if (itemData.type === "magic") {
      return { img: this.DEFAULT_ICON_MAGIC };
    }
    return { img: this.DEFAULT_ICON };
  }

  get isUnlocked() {
    return !this.system.locked;
  }

  get hasImage(){
    if (this.type === "magic")  return this.img && this.img !== "/systems/cthack/ui/icons/spell-book.png";
    else return this.img && this.img !== "icons/svg/item-bag.svg";
  }
}
