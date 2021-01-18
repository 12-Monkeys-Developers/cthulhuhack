import { CTHACK } from "../config.js";
import { diceRoll } from "../dice.js";
import { findLowerDice } from "../utils.js";
import { manageActiveEffect } from "../effects.js";

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

   /** @override */
   prepareDerivedData() {
    switch ( this.data.type ) {
      case "character":
        return ;
      case "opponent":
        return this._prepareOpponentDerivedData(this.data);
    }
  }

  /**
   * Prepare opponent type-specific data
   * @param actorData
   * @private
   */
  _prepareOpponentDerivedData(actorData) {
    const data = actorData.data;
    data.malus = -1 * (data.hitDice - 1);
  }

  /**
   * Roll a Saving Throw 
   * Prompt the user for input regarding Advantage/Disadvantage
   * @param {String} saveId       The save ID (e.g. "str")
   * @param {Object} options      Options which configure how save tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
  async rollSave(saveId, options={}) {
    if (CONFIG.debug.cthack) console.log(`Roll save ${saveId}`);
    const save = CTHACK.saves[saveId];
    const label = game.i18n.localize(save);
    const saveValue = this.data.data.saves[saveId].value;
    const abilitiesAdvantages = this._findSavesAdvantages(saveId);
    let hasAdvantage = false;
    let hasDisadvantage = false;
    if (this.getFlag("cthack","disadvantageOOA") !== undefined && this.getFlag("cthack","disadvantageOOA") === true){
      console.log("Out of Action Disadvantage");
      hasDisadvantage = true;
    };

    // Roll and return
    const rollData = mergeObject(options, {
      title: game.i18n.format("CTHACK.SavePromptTitle", {save: label}),   
      rollType: "Save",
      targetValue: saveValue,
      abilitiesAdvantages: abilitiesAdvantages,
      advantage: hasAdvantage,
      disadvantage: hasDisadvantage
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
    if (CONFIG.debug.cthack)  console.log(`Roll resource ${resourceId}`);
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
      rollType: "Resource",
      diceType: resourceValue
    });
    rollData.speaker = options.speaker || ChatMessage.getSpeaker({actor: this});
    
    const result = await diceRoll(rollData);
    return result;
  }

  /**
   * Roll a Material dice
   * @param {String} dice         The type of dice (e.g. "d6")
   * @param {Object} options      Options which configure how resource tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
  async rollMaterial(dice, options={}) {
    if (CONFIG.debug.cthack) console.log(`Roll material ${dice}`);

    // Material at "0"
    if (dice === "0"){
      return null;
    }

    // Roll and return
    const rollData = mergeObject(options, {
      title: game.i18n.format("CTHACK.MaterialRollPromptTitle"),
      rollType: "Material",
      diceType: dice
    });
    rollData.speaker = options.speaker || ChatMessage.getSpeaker({actor: this});
    
    return diceRoll(rollData);
  }

   /**
   * Decrease a Resource dice
   * @param {String} resourceId   The resource ID (e.g. "smo")
   */  
  async decreaseResource(resourceId){
    if (CONFIG.debug.cthack) console.log(`Decrease resource ${resourceId}`);
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
   * @param {String} damageId     The damage ID (e.g. "armed" "unarmed" "attack")
   * @param {Object} options      Options which configure how damage tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
  async rollDamageRoll(damageId, options={}) {
    if (CONFIG.debug.cthack) console.log(`Roll ${damageId} roll`);

    const damageDice = this.data.data.attributes[damageId].value;

    const damage = CTHACK.attributes[damageId];
    const label = game.i18n.localize(damage);

    // Roll and return
    const rollData = mergeObject(options, {
      title: label,
      diceType: damageDice,
      rollType: "Damage"
    });
    rollData.speaker = options.speaker || ChatMessage.getSpeaker({actor: this});
    return diceRoll(rollData);
  }

  /**
   * Roll an attack damage
   * @param {String} damageDice   The damage dice
   * @param {Object} options      Options which configure how damage tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
  async rollAttackDamageRoll(damageDice, options={}) {
    if (CONFIG.debug.cthack) console.log(`Roll attack ${damageDice} roll`);

    const label = game.i18n.localize("CTHACK.DamageDiceRollPrompt"); 

    // Roll and return
    const rollData = mergeObject(options, {
      title: label,
      customFormula: damageDice,
      rollType: "AttackDamage"
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

  _findSavesAdvantages(saveId){
    let advantages = "<ul>";
    let abilitiesList = this.data.data.abilities;
    for (let index = 0; index < abilitiesList.length; index++) {
      const element = abilitiesList[index];
      if (element.key === "SWILEA" && (saveId === "str" || saveId === "dex" || saveId === "con")){
        advantages += "<li>" + game.i18n.localize("CTHACK.AdvantageSWILEA") + "</li>";
      } 
      if (element.key === "STA"){
        advantages += "<li>" + game.i18n.localize("CTHACK.AdvantageSTA") + "</li>";
      }
      if (element.key === "ANIHAN"){
        advantages += "<li>" + game.i18n.localize("CTHACK.AdvantageANIHAN") + "</li>";
      }
      if (element.key === "IND" && (saveId === "wis" || saveId === "int" || saveId === "cha")){
        advantages += "<li>" + game.i18n.localize("CTHACK.AdvantageIND") + "</li>";
      }
      if (element.key === "MEC"){
        advantages += "<li>" + game.i18n.localize("CTHACK.AdvantageMEC") + "</li>";
      }
      if (element.key === "IROMIN"){
        advantages += "<li>" + game.i18n.localize("CTHACK.AdvantageIROMIN") + "</li>";
      }
      if (element.key === "RIP" && (saveId === "str")){
        advantages += "<li>" + game.i18n.localize("CTHACK.AdvantageRIP") + "</li>";
      }
      if (element.key === "LEG"){
        advantages += "<li>" + game.i18n.localize("CTHACK.AdvantageLEG") + "</li>";
      }
      if (element.key === "SELPRE"){
        advantages += "<li>" + game.i18n.localize("CTHACK.AdvantageSELPRE") + "</li>";
      }
      if (element.key === "HAR"){
        advantages += "<li>" + game.i18n.localize("CTHACK.AdvantageHAR") + "</li>";
      }      
    }
    if (advantages === "<ul>") {
      advantages = "";
    }
    else advantages += "</ul>";
    return advantages;
  }

  /**
   * Create a definition item with the active effect if necessary
   * @param {*} itemData 
   */
async  createDefinitionItem(itemData){
    if (itemData.data.key === "OOA-CRB" || itemData.data.key === "OOA-MIC" || itemData.data.key === "OOA-STA" || itemData.data.key === "OOA-WIN"){
      this._createActiveEffect(itemData);
    }
    else if (itemData.data.key.startsWith('OOA') || itemData.data.key.startsWith('TI') || itemData.data.key.startsWith('SK')){
      this._createActiveEffect(itemData);
    }
    
    // Create the owned item
    return this.createEmbeddedEntity("OwnedItem", itemData, {renderSheet: true});
  }

async _createActiveEffect(itemData){
    console.log(itemData);

    let effectData;

    if (itemData.data.key === "OOA-CRB"){
      effectData = {
        label: "OOA-CRB",
        icon: "systems/cthack/ui/icons/first-aid-kit.png",
        changes: [{
            key: "data.saves.str.value",
            mode: 2,
            value: -4,
            priority: "20"},
          {
            key: "data.saves.dex.value",
            mode: 2,
            value: -4,
            priority: "20"
          },{
            key: "data.saves.con.value",
            mode: 2,
            value: -4,
            priority: "20"
        }],
        duration: {
          "seconds": 3600
        },
        tint: "#BB0022"
      };
    }
    else if (itemData.data.key === "OOA-MIC"){
      effectData = {
        label: "OOA-MIC",
        icon: "systems/cthack/ui/icons/first-aid-kit.png",
        duration: {
          "seconds": 1200
        },
        tint: "#BB0022"
      };
      await this.setFlag("cthack", "disadvantageOOA", true);
    }
    else if (itemData.data.key === "OOA-STA"){
      effectData = {
        label: "OOA-STA",
        icon: "systems/cthack/ui/icons/first-aid-kit.png",
        duration: {
          "seconds": 600
        },
        tint: "#BB0022"
      };
      await this.setFlag("cthack", "disadvantageOOA", true);
    }
    else if (itemData.data.key === "OOA-WIN"){
      effectData = {
        label: "OOA-WIN",
        icon: "systems/cthack/ui/icons/first-aid-kit.png",
        duration: {
          "seconds": 60
        },
        tint: "#BB0022"
      };
      await this.setFlag("cthack", "disadvantageOOA", true);
    }
    else if (itemData.data.key.startsWith('OOA')){
      effectData = {
        label: itemData.data.key,
        icon: "systems/cthack/ui/icons/first-aid-kit.png",
        duration: {
          "seconds": 3600
        },
        tint: "#BB0022"
      };
    }
    else if (itemData.data.key.startsWith('TI')){
      effectData = {
        label: itemData.data.key,
        icon: "systems/cthack/ui/icons/screaming.png",
        duration: {
          "seconds": 3600
        },
        tint: "#BB0022"
      };
    }
    else if (itemData.data.key.startsWith('SK')){
      effectData = {
        label: itemData.data.key,
        icon: "systems/cthack/ui/icons/dead-head.png",
        duration: {
          "seconds": 3600
        },
        tint: "#BB0022"
      };
    }
    
    // Create the Active Effect
    this.createEmbeddedEntity("ActiveEffect", effectData);
  }

  /**
   * Delete the associated active effect of a definition item if necessary
   * @param {*} itemData 
   */
  async deleteEffectFromItem(item){
    // Delete the Active Effect
    let effect;
    const definitionKey = item.data.data.key;
    console.log("deleteDefinitionItem : definitionKey = " + definitionKey);
    if (definitionKey === "OOA-CRB"){
      effect = this.effects.find(i => i.data.label === definitionKey);
      console.log("Delete Active Effect : " + effect.data._id);
      await this.deleteEmbeddedEntity("ActiveEffect", effect.data._id);
    }
    else if (definitionKey === "OOA-MIC" || definitionKey === "OOA-STA" || definitionKey === "OOA-WIN"){
      effect = this.effects.find(i => i.data.label === definitionKey);
      console.log("Delete Active Effect : " + effect.data._id);      
      await this.deleteEmbeddedEntity("ActiveEffect", effect.data._id);
      await this.unsetFlag("cthack","disadvantageOOA");
    }
    else if (definitionKey.startsWith('OOA')){
      effect = this.effects.find(i => i.data.label === definitionKey);
      console.log("Delete Active Effect : " + effect.data._id);
      await this.deleteEmbeddedEntity("ActiveEffect", effect.data._id);
    }
    else if (definitionKey.startsWith('TI')){
      effect = this.effects.find(i => i.data.label === definitionKey);
      console.log("Delete Active Effect : " + effect.data._id);
      await this.deleteEmbeddedEntity("ActiveEffect", effect.data._id);
    }
    else if (definitionKey.startsWith('SK')){
      effect = this.effects.find(i => i.data.label === definitionKey);
      console.log("Delete Active Effect : " + effect.data._id);
      await this.deleteEmbeddedEntity("ActiveEffect", effect.data._id);
    }
  }
  
}