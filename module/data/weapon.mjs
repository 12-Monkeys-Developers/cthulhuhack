import CommonItem from "./common-item.mjs"
import { SYSTEM } from "../config/system.mjs"

export default class CtHackWeapon extends CommonItem {
  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = ["CTHACK.Weapon"]

  static defineSchema() {
    const fields = foundry.data.fields
    const common = super.defineSchema()
    const schema = { ...common }
    schema.dice = new fields.StringField({ required: true, nullable: false, blank:true, choices: SYSTEM.DICE_VALUES, initial: "" })
    schema.range = new fields.StringField({ required: true, nullable: false, blank: true, choices: SYSTEM.RANGE, initial: "" })
    return schema
  }

  get hasRange() {
    return this.range !== ""
  }

  get hasDice() {
    return this.dice !== "" && this.dice !== "0" && this.dice !== "1"
  }
}
