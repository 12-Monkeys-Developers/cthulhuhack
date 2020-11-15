import { CTHACK } from "../config.js";
import { diceRoll } from "../dice.js";
import { findLowerDice } from "../utils.js";

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
    console.log(`Roll save ${abilityId}`);
    const ability = CTHACK.abilities[abilityId];
    const label = game.i18n.localize(ability);
    const abilityValue = this.data.data.abilities[abilityId].value;

    // Roll and return
    const rollData = mergeObject(options, {
      title: game.i18n.format("CTHACK.SavePromptTitle", {ability: label}),   
      targetValue: abilityValue
    });
    rollData.speaker = options.speaker || ChatMessage.getSpeaker({actor: this});
    return diceRoll(rollData);
  }

   /**
   * Roll a Resource dice
   * @param {String} resourceId   The resource ID (e.g. "smo")
   * @param {Object} options      Options which configure how resource tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
  async rollResource(resourceId, options={}) {
    console.log(`Roll resource ${resourceId}`);
    const resource = CTHACK.resources[resourceId];
    const label = game.i18n.localize(resource);
    const resourceTemplate = CTHACK.resourcesTemplate[resourceId];
    const resourceValue = this.data.data.attributes[resourceTemplate].value;

    // Resource at "0"
    if (resourceValue === "0"){
      return null;
    }

    // Roll and return
    const rollData = mergeObject(options, {
      title: game.i18n.format("CTHACK.ResourceRollPromptTitle", {resource: label}),
      resourceRoll: true,
      diceType: resourceValue
    });
    rollData.speaker = options.speaker || ChatMessage.getSpeaker({actor: this});
    
    return diceRoll(rollData);
  }

   /**
   * Decrease a resource dice
   * @param {String} resourceId   The resource ID (e.g. "smo")
   */  
  async decreaseResource(resourceId){
    console.log(`Decrease resource ${resourceId}`);
    const actorData = this.data;
    const actorResourceName = CTHACK.resourcesTemplate[resourceId];
    const actorResource = actorData.data.attributes[actorResourceName];

    // old value is 0 or dx
    const oldValue = actorResource.value;
    if (oldValue != "0"){
      let newValue = findLowerDice(oldValue);
      actorResource.value = newValue;
      if (resourceId === "fla"){
        this.update({'data.attributes.flashlights': actorResource});
      }
      else if (resourceId === "smo"){
        this.update({'data.attributes.smokes': actorResource});
      }
      else if (resourceId === "san"){
        this.update({'data.attributes.sanity': actorResource});
      }
    }
  }
}