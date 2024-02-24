import CommonItem from "./common-item.mjs";

export default class CtHackAttack extends CommonItem {
  static defineSchema() {
    const fields = foundry.data.fields;
    const common = super.defineSchema();
    const schema = { ...common };
    schema.nb = new fields.NumberField({ required: true, nullable: false, initial: 1, min: 1 });
    schema.damage = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 });
    schema.damageDice = new fields.StringField({ required: true, nullable: false, initial: "" });
    return schema;
  }

  /**
   * Get the details of the item.
   * @returns {string} The details of the item.
   */
  get details() {
    let details = "";
    if (this.damage !== 0) {
      details += `${this.damage} (${game.i18n.localize('CTHACK.Damage')})&nbsp;&nbsp;`;
    }
    if (this.damageDice !== "0") {
      details += `<i class="fas fa-dice-d20 attack rollable">&nbsp;&nbsp;</i>  ${this.damageDice} (${game.i18n.localize('CTHACK.Damage')})`;
    }
    if (this.nb > 1) {
      details += `x ${this.nb}`;
    }

    return details;
  }
}
