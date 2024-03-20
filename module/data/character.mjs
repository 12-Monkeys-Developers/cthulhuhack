import { SYSTEM } from "../config/system.mjs";

export default class CtHackCharacter extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.locked = new fields.BooleanField({ required: true, nullable: false, initial: false });
    
    // Saves
    const saveField = (label) => {
      const schema = {
        value: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
        advantage: new fields.BooleanField({ required: true, nullable: false, initial: false }),
      };
      return new fields.SchemaField(schema, { label });
    };
    schema.saves = new fields.SchemaField(
      Object.values(SYSTEM.SAVES).reduce((obj, save) => {
        obj[save.id] = saveField(save.label);
        return obj;
      }, {})
    );

    // Resources : attribute
    const resourceField = (label) => {
      const schema = {
        value: new fields.StringField({ required: false, blank: true, initial: "d6" }),
        max: new fields.StringField({ required: false, blank: true, initial: "d6" }),
      };
      return new fields.SchemaField(schema, { label });
    };
    const damageField = (label) => {
      const schema = {
        value: new fields.StringField({ required: false, blank: true, initial: "d6" }),
      };
      return new fields.SchemaField(schema, { label });
    };
    const adrenalineField = (label) => {
      const schema = {
        value: new fields.StringField({ required: false, blank: true, initial: "pj" }),
      };
      return new fields.SchemaField(schema, { label });
    };

    const resourcesObject = Object.values(SYSTEM.RESOURCES).reduce((obj, item) => {
      obj[item.id] = resourceField(item.label);
      return obj;
    }, {});

    const savesObject = Object.values(SYSTEM.DAMAGES).reduce((obj, item) => {
      obj[item.id] = damageField(item.label);
      return obj;
    }, {});

    const adrenalineObject = Object.values(SYSTEM.ADRENALINE).reduce((obj, item) => {
      obj[item.id] = adrenalineField(item.label);
      return obj;
    }, {});

    const attributes = { ...resourcesObject, ...savesObject, ...adrenalineObject };

    schema.attributes = new fields.SchemaField(attributes);

    schema.shortDescription = new fields.HTMLField({ required: false, blank: true, textSearch: true });
    schema.biography = new fields.HTMLField({ required: false, blank: true, textSearch: true });
    schema.notes = new fields.HTMLField({ required: false, blank: true, textSearch: true });
    schema.equipment = new fields.HTMLField({ required: false, blank: true, textSearch: true });
    schema.archetype = new fields.StringField({ required: false, blank: true });
    schema.occupation = new fields.StringField({ required: false, blank: true });
    schema.abilities = new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField({ required: true, blank: false, nullable: false }),
        key: new fields.StringField({ required: true, blank: false, nullable: false }),
      })
    );

    schema.hp = new fields.SchemaField({
      value: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
      min: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
      max: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    });

    return schema;
  }

  get hasShortDescription() {
    return this.shortDescription !== null && this.shortDescription !== '';
  }

  get hasOccupation() {
    return this.occupation !== null && this.occupation !== '';
  }

  get hasArchetype() {
    return this.archetype !== null && this.archetype !== '';
  }
}
