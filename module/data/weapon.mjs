export default class CtHackWeapon extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};
    schema.description = new fields.HTMLField({ required: false, blank: true, textSearch: true });
    schema.dice = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.range = new fields.StringField({ required: true, nullable: false, initial: "" });
    return schema;
  }
}
