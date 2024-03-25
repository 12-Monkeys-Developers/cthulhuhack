export default class CtHackOpponent extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};
    schema.description = new fields.HTMLField({ required: false, blank: true, textSearch: true });
    schema.shortDescription = new fields.HTMLField({ required: false, blank: true, textSearch: true });
    schema.locked = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.hitDice = new fields.NumberField({ required: true, nullable: false, integer: true, positive: true, initial: 1, min: 1 });
    schema.armor = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 });
    schema.malus = new fields.NumberField({ required: true, nullable: false, initial: 0 });
    schema.hp = new fields.SchemaField({
        value: new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 }),
        min: new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 }),
        max: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 })
    });

    return schema;
  }
}
