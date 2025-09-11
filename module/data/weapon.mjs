import { SYSTEM } from "../config/system.mjs"
import CommonItem from "./common-item.mjs"
import CtHackItem from "../documents/item.mjs"

export default class CtHackWeapon extends CommonItem {
  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = ["CTHACK.Weapon"]

  static defineSchema() {
    const fields = foundry.data.fields
    const common = super.defineSchema()
    const schema = { ...common }
    schema.dice = new fields.StringField({ required: true, nullable: false, blank: true, choices: SYSTEM.DICE_VALUES, initial: "" })
    schema.range = new fields.StringField({ required: true, nullable: false, blank: true, choices: SYSTEM.RANGE, initial: "" })
    schema.size = new fields.SchemaField({
      equipped: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 3 }),
      unequipped: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 3 }),
      status: new fields.StringField({ required: true, choices: SYSTEM.SIZE, initial: SYSTEM.SIZE.equipped.id }),
    })
    return schema
  }

  get hasRange() {
    return this.range !== ""
  }

  get hasDice() {
    return this.dice !== "" && this.dice !== "0" && this.dice !== "1"
  }

  hasSizeUnequipped() {
    return this.size.unequipped > 0
  }

  hasDefaultImage() {
    return this.parent.img === CtHackItem.DEFAULT_ICON
  }
}
