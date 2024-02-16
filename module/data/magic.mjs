import CommonItem from "./common-item.mjs";

export default class CtHackMagic extends CommonItem {
  static defineSchema() {
    const fields = foundry.data.fields;
    const common = super.defineSchema();
    const schema = { ...common };
    schema.subtype = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.dice = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.incantation = new fields.StringField({ required: true, nullable: false, initial: "" });
    return schema;
  }
}
