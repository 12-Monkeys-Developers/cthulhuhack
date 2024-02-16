import CommonItem from "./common-item.mjs";

export default class CtHackAbility extends CommonItem {
  static defineSchema() {
    const fields = foundry.data.fields;
    const common = super.defineSchema();
    const schema = { ...common };
    schema.key = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.uses = new fields.ObjectField({ required: true, nullable: false, initial: { value: 1, max: 1, per: "Permanent", last: "" } });
    schema.multiple = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.isCustom = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.advantageGiven = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.advantageText = new fields.StringField({ required: true, nullable: false, initial: "" });
    return schema;
  }
}
