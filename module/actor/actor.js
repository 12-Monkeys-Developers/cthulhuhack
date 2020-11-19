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
   * Roll a Saving Throw 
   * Prompt the user for input regarding Advantage/Disadvantage
   * @param {String} saveId       The save ID (e.g. "str")
   * @param {Object} options      Options which configure how save tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
  async rollSave(saveId, options={}) {
    console.log(`Roll save ${saveId}`);
    const save = CTHACK.saves[saveId];
    const label = game.i18n.localize(save);
    const saveValue = this.data.data.saves[saveId].value;

    // Roll and return
    const rollData = mergeObject(options, {
      title: game.i18n.format("CTHACK.SavePromptTitle", {save: label}),   
      targetValue: saveValue
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

  /**
   * Roll an armed or unarmed damage
   * @param {String} damageId     The damage ID (e.g. "armed" "unarmed")
   * @param {Object} options      Options which configure how damage tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
  async rollDamageRoll(damageId, options={}) {
    console.log(`Roll ${damageId} roll`);

    const damageDice = this.data.data.attributes[damageId].value;

    const damage = CTHACK.attributes[damageId];
    const label = game.i18n.localize(damage);

    // Roll and return
    const rollData = mergeObject(options, {
      title: label,
      diceType: damageDice
    });
    rollData.speaker = options.speaker || ChatMessage.getSpeaker({actor: this});
    return diceRoll(rollData);
  }
  
  deleteAbility(key, itemId){
    const index = this._findAbilityIndex(key,itemId);
    if (index !== -1){
      let abilitiesList = this.data.data.abilities;
      abilitiesList.splice (index, 1);
      
      this.update({'data.abilities': abilitiesList});
    }    
  }

  _findAbilityIndex(key,id){
    let abilitiesList = this.data.data.abilities;
    let trouve = false;
    let index = -1;
    let i = 0;
    while (!trouve && i < abilitiesList.length) {
      if (key === abilitiesList[i].key){
        trouve = true;
        index = i;
      }
      i++;
    }
    return index;
  }
}