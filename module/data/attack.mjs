export default class CtHackAttack extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};
    schema.description = new fields.HTMLField({ required: false, blank: true, textSearch: true });
    schema.damage = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.damageDice = new fields.StringField({ required: true, nullable: false, initial: "" });
    return schema;
  }
}
