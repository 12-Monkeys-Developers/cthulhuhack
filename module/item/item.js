/**
 * @extends {Item}
 */
export class CtHackItem extends Item {
  get details() {
    if (this.type === "attack") {
      let details = "";
      if (this.system.damage !== "0") {
        details += `${this.system.damage} (dégâts)&nbsp;&nbsp;`;
      }
      if (this.system.damageDice !== "") {
        details += `<i class="fas fa-dice-d20 attack rollable">&nbsp;&nbsp;</i>  ${this.system.damageDice} (dégâts)`;
      }
      return details;
    }
    return;
  }
}
