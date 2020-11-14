import {CTHACK} from "../config.js";
import {d20Roll} from "../dice.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class CtHackActor extends Actor {

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep things organized.
  }

    /**
   * Roll an Ability Saving Throw
   * Prompt the user for input regarding Advantage/Disadvantage
   * @param {String} abilityId    The ability ID (e.g. "str")
   * @param {Object} options      Options which configure how ability tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
  async rollAbilitySave(abilityId, options={}) {
    console.log("AbilityId = " + abilityId);
    const ability = CTHACK.abilities[abilityId];
    const label = game.i18n.localize(ability);
    const abilityValue = this.data.data.abilities[abilityId].value;

    // Roll and return
    const rollData = mergeObject(options, {
      title: game.i18n.format("CTHACK.SavePromptTitle", {ability: label}),   
      targetValue: abilityValue
    });
    rollData.speaker = options.speaker || ChatMessage.getSpeaker({actor: this});
    return d20Roll(rollData);
  }
}