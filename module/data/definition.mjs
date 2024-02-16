import CommonItem from "./common-item.mjs";

export default class CtHackDefinition extends CommonItem {
  static defineSchema() {
    const fields = foundry.data.fields;
    const common = super.defineSchema();
    const schema = { ...common };
    schema.definitionType = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.key = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.creationDate = new fields.StringField({ required: true, nullable: false, initial: "" });
    return schema;
  }
}
