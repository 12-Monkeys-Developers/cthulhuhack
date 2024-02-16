export default class CtHackDefinition extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};
    schema.description = new fields.HTMLField({ required: false, blank: true, textSearch: true });
    schema.definitionType = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.key = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.creationDate = new fields.StringField({ required: true, nullable: false, initial: "" });
    return schema;
  }
}
