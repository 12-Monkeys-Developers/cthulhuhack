import { SYSTEM } from "../config/system.mjs";
import CommonItem from "./common-item.mjs";

export default class CtHackMagic extends CommonItem {
  static defineSchema() {
    const fields = foundry.data.fields;
    const common = super.defineSchema();
    const schema = { ...common };
    schema.subtype = new fields.StringField({ required: true, choices: SYSTEM.MAGIC_TYPE, initial: "spell" });
    schema.dice = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.incantation = new fields.StringField({ required: true, nullable: false, initial: "" });
    return schema;
  }

  get subtypeLabel() {
    return game.i18n.localize(SYSTEM.MAGIC_TYPE[this.subtype].label);
  }

  get hasDice() {
    return this.dice !== "0" && this.dice !== "";
  }
}
