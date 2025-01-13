import CommonItem from "./common-item.mjs"
import { formatDate } from "../utils.mjs"

export default class CtHackAbility extends CommonItem {
  static defineSchema() {
    const fields = foundry.data.fields
    const common = super.defineSchema()
    const schema = { ...common }
    schema.key = new fields.StringField({ required: true, nullable: false, initial: "" })
    schema.uses = new fields.ObjectField({ required: true, nullable: false, initial: { value: 1, max: 1, per: "Permanent", last: "" } })
    schema.multiple = new fields.BooleanField({ required: true, nullable: false, initial: false })
    schema.isCustom = new fields.BooleanField({ required: true, nullable: false, initial: false })
    schema.advantageGiven = new fields.BooleanField({ required: true, nullable: false, initial: false })
    schema.advantageText = new fields.StringField({ required: true, nullable: false, initial: "" })
    return schema
  }
  
  get hasUse() {
    return this.uses.per !== "Permanent"
  }

  get hasLastUse() {
    return this.uses.last !== ""
  }

  get isUsable() {
    return this.uses.per !== "Permanent" && this.uses.value > 0
  }

  get isResetable() {
    return this.uses.per !== "Permanent" && this.uses.max !== 0 && this.uses.value === 0
  }

  get isIncreaseable() {
    return this.uses.per !== "Permanent" && this.uses.value < this.uses.max
  }

  /**
   * Uses the ability : decrease the remaining use by 1
   * @returns {Promise<void>} A promise that resolves when the ability is used.
   */
  async use() {
    if (this.uses.per === "Permanent") {
      return
    }
    if (this.uses.value > 0) {
      return this.parent.update({ "system.uses.value": this.uses.value - 1, "system.uses.last": formatDate(new Date()) })
    }
  }

  /**
   * Resets the use of the opponent's ability.
   * If the uses are set to "Permanent", no action is taken.
   * If the current use value is equal to 0 remaining use, the parent object is updated with the maximum use value and an empty last use value.
   * @returns {Promise<void>} A promise that resolves once the use is reset.
   */
  async resetUse() {
    if (this.uses.per === "Permanent") {
      return
    }
    if (this.uses.value === 0) {
      return this.parent.update({ "system.uses.value": this.uses.max, "system.uses.last": "" })
    }
  }

  /**
   * Increases the usage value of the opponent ability.
   * If the usage is "Permanent", no decrease is performed.
   * If the usage value is greater than 0, it updates the parent object with the decreased value.
   * @returns {Promise<void>} A promise that resolves once the decrease is performed.
   */
  async increase() {
    if (this.uses.per === "Permanent") {
      return
    }
    if (this.uses.value < this.uses.max) {
      return this.parent.update({ "system.uses.value": this.uses.value + 1 })
    }
  }
}
