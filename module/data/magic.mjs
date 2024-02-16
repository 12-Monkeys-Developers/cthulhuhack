export default class CtHackMagic extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};
    schema.description = new fields.HTMLField({ required: false, blank: true, textSearch: true });
    schema.subtype = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.dice = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.incantation = new fields.StringField({ required: true, nullable: false, initial: "" });
    return schema;
  }
}
