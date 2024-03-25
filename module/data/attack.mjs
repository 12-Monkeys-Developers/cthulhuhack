import CommonItem from "./common-item.mjs";

export default class CtHackAttack extends CommonItem {
  static defineSchema() {
    const fields = foundry.data.fields;
    const common = super.defineSchema();
    const schema = { ...common };
    schema.nb = new fields.NumberField({ required: true, nullable: false, initial: 1, min: 1 });
    schema.damage = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 });
    schema.damageDice = new fields.StringField({ required: true, nullable: false, initial: "" });
    return schema;
  }

  /**
   * Get the details of the item.
   * @returns {string} The details of the item.
   */
  get details() {
    let details = "";
    if (this.hasDamageDice) {
      details += ` ${this.damageDice} (${game.i18n.localize('CTHACK.Damage')})`;
    }    
    if (this.damage !== 0) {
      details += `${this.damage} (${game.i18n.localize('CTHACK.Damage')})&nbsp;&nbsp;`;
    }
    if (this.nb > 1) {
      details += `x ${this.nb}`;
    }
    return details;
  }

  /**
   * Checks if the attack has damage dice.
   * @returns {boolean} True if the attack has damage dice, false otherwise.
   */
  get hasDamageDice() {
    return this.damageDice !== "0" && this.damageDice !== "";
  }
}
