export default class CtHackAbility extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};
    schema.description = new fields.HTMLField({ required: false, blank: true, textSearch: true });
    schema.key = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.uses = new fields.ObjectField({ required: true, nullable: false, initial: { value: 1, max: 1, per: "Permanent", last: "" } });
    schema.multiple = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.isCustom = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.advantageGiven = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.advantageText = new fields.StringField({ required: true, nullable: false, initial: "" });
    return schema;
  }
}
