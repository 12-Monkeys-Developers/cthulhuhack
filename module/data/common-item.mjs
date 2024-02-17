export default class CommonItem extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const schema = {};
        schema.description = new fields.HTMLField({ required: false, blank: true, textSearch: true });
        schema.locked = new fields.BooleanField({ required: true, nullable: false, initial: false });
        return schema;
    }

    get hasDescription() {
        return !!this.description;
    }
}