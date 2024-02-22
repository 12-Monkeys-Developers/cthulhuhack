import CommonItem from "./common-item.mjs";

export default class CtHackItem extends CommonItem {
  static defineSchema() {
    const fields = foundry.data.fields;
    const common = super.defineSchema();
    const schema = { ...common };
    schema.dice = new fields.StringField({ required: true, nullable: false, initial: "" });
    return schema;
  }
}
