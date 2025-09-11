import CommonItem from "./common-item.mjs";

export default class CtHackArchetype extends CommonItem {
  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = ["CTHACK.ArchetypeData"]

  static defineSchema() {
    const fields = foundry.data.fields;
    const common = super.defineSchema();
    const schema = { ...common };
    schema.flashlights = new fields.StringField({ required: true, nullable: false, blank: false, choices: SYSTEM.DICE_MAX_VALUES, initial: "d6" })
    schema.smokes = new fields.StringField({ required: true, nullable: false, blank: false, choices: SYSTEM.DICE_MAX_VALUES, initial: "d6" })
    schema.hitdice = new fields.StringField({ required: true, nullable: false, blank: false, choices: SYSTEM.DICE_MAX_VALUES, initial: "d6" })
    schema.hitpoints = new fields.StringField({ required: true, nullable: false, initial: "d6" });
    schema.wealthStart = new fields.StringField({ required: true, nullable: false, blank: false, choices: SYSTEM.WEALTH_START, initial: "3" })
    schema.wealthDice = new fields.StringField({ required: true, nullable: false, blank: false, choices: SYSTEM.DICE_MAX_VALUES, initial: "d6" })
    schema.sanity = new fields.StringField({ required: true, nullable: false, blank: false, choices: SYSTEM.DICE_MAX_VALUES, initial: "d6" })
    schema.armeddamage = new fields.StringField({ required: true, nullable: false, blank: false, choices: SYSTEM.DICE_DAMAGE_VALUES, initial: "d6" })
    schema.unarmeddamage = new fields.StringField({ required: true, nullable: false, blank: false, choices: SYSTEM.DICE_DAMAGE_VALUES, initial: "d6" })
    schema.primarysave = new fields.StringField({ required: true, nullable: false, blank: false, choices: SYSTEM.SAVES, initial: SYSTEM.SAVES.dex.id })
    schema.secondarysave1 = new fields.StringField({ required: true, nullable: false, blank: false, choices: SYSTEM.SAVES, initial: SYSTEM.SAVES.con.id });
    schema.secondarysave2 = new fields.StringField({ required: true, nullable: false, blank: false, choices: SYSTEM.SAVES, initial:  SYSTEM.SAVES.str.id });
    schema.capacities = new fields.ArrayField(new fields.StringField());
    return schema;
  }
}
