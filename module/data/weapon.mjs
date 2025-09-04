import CommonItem from "./common-item.mjs"

export default class CtHackWeapon extends CommonItem {
  static defineSchema() {
    const fields = foundry.data.fields
    const common = super.defineSchema()
    const schema = { ...common }
    schema.dice = new fields.StringField({ required: true, nullable: false, initial: "" })
    schema.range = new fields.StringField({ required: true, nullable: false, initial: "" })
    return schema
  }

  get hasRange() {
    return this.range !== ""
  }

  get hasDice() {
    return this.dice !== "" && this.dice !== "0" && this.dice !== "1"
  }
}
