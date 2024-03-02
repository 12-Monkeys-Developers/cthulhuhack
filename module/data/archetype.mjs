export default class CtHackArchetype extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};
    schema.description = new fields.HTMLField({ required: false, blank: true, textSearch: true });
    schema.flashlights = new fields.StringField({ required: true, nullable: false, initial: "d6" });
    schema.smokes = new fields.StringField({ required: true, nullable: false, initial: "d6" });
    schema.hitdice = new fields.StringField({ required: true, nullable: false, initial: "d6" });
    schema.hitpoints = new fields.StringField({ required: true, nullable: false, initial: "d6" });
    schema.wealthStart = new fields.StringField({ required: true, nullable: false, initial: "3" });
    schema.wealthDice = new fields.StringField({ required: true, nullable: false, initial: "d8" });
    schema.sanity = new fields.StringField({ required: true, nullable: false, initial: "d6" });
    schema.armeddamage = new fields.StringField({ required: true, nullable: false, initial: "d6" });
    schema.unarmeddamage = new fields.StringField({ required: true, nullable: false, initial: "d6" });
    schema.primarysave = new fields.StringField({ required: true, nullable: false, initial: "dex" });
    schema.secondarysave1 = new fields.StringField({ required: true, nullable: false, initial: "con" });
    schema.secondarysave2 = new fields.StringField({ required: true, nullable: false, initial: "for" });
    schema.capacities = new fields.ArrayField(new fields.StringField());
    return schema;
  }
}
