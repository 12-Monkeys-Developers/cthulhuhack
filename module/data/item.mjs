import CommonItem from "./common-item.mjs";

export default class CtHackItem extends CommonItem {
  static defineSchema() {
    const fields = foundry.data.fields;
    const common = super.defineSchema();
    const schema = { ...common };
    schema.dice = new fields.StringField({ required: true, nullable: false, initial: "" });
    return schema;
  }

  /**
   * Get the details of the item.
   * @returns {string} The details of the item.
   */
  get details() {
    let details = "";
    if (this.damage !== "0") {
      details += `${this.damage} (dégâts)&nbsp;&nbsp;`;
    }
    if (this.damageDice !== "") {
      details += `<i class="fas fa-dice-d20 attack rollable">&nbsp;&nbsp;</i>  ${this.damageDice} (dégâts)`;
    }
    return details;
  }
}
