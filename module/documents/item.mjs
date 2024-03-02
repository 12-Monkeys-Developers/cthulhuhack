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
}
