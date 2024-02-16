import CommonItem from "./common-item.mjs";

export default class CtHackAttack extends CommonItem {
  static defineSchema() {
    const fields = foundry.data.fields;
    const common = super.defineSchema();
    const schema = { ...common };
    schema.damage = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.damageDice = new fields.StringField({ required: true, nullable: false, initial: "" });
    return schema;
  }
}
