import { CTHACK } from "../config.js";
import { diceRoll } from "../dice.js";
import { formatDate, findLowerDice } from "../utils.js";
import { LOG_HEAD } from "../constants.js";
import { ROLL_TYPE } from "../config/system.mjs";

/**
 * @extends {Actor}
 */
export default class CtHackActor extends Actor {
  /**
   * @name rollSave
   * @description Roll a Saving Throw
   *              Prompt the user for input regarding Advantage/Disadvantage
   * @public
   *
   * @param {String} saveId       The save ID (e.g. "str")
   * @param {Object} options      Options which configure how save tests are rolled
   *
   * @returns {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
  async rollSave(saveId, options = {}) {
    const v2 = game.settings.get("cthack", "Revised") ? true : false;
    if (CTHACK.debug) console.log(`${LOG_HEAD}Roll save ${saveId}`);
    const save = CTHACK.saves[saveId];
    const label = game.i18n.localize(save);
    const saveValue = this.system.saves[saveId].value;
    const abilitiesAdvantages = v2 ? this.findSavesAdvantages(saveId) : this.findSavesAdvantagesHTML(saveId);
    let hasAdvantage = false;
    let hasDisadvantage = false;
    if (this.getFlag("cthack", "disadvantageOOA") !== undefined && this.getFlag("cthack", "disadvantageOOA") === true) {
      if (CTHACK.debug) console.log("CTHACK | Out of Action Disadvantage");
      hasDisadvantage = true;
    }

    // V1
    if (!v2) {
      // Roll and return
      const rollData = foundry.utils.mergeObject(options, {
        rollType: "Save",
        title: game.i18n.format("CTHACK.SavePromptTitle", { save: label }),
        rollId: label,
        targetValue: saveValue,
        abilitiesAdvantages: abilitiesAdvantages,
        advantage: hasAdvantage,
        disadvantage: hasDisadvantage,
      });
      rollData.speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });
      return await diceRoll(rollData);
    }
    // V2
    else 
    {
      return await this.system.roll(ROLL_TYPE.SAVE, saveId)
    }

  }

  /**
   * @name rollResource
   * @description Roll a Saving Throw
   *              Prompt the user for input regarding Advantage/Disadvantage
   * @public
   *
   * @param {String} resourceId   The resource ID (e.g. "smokes")
   * @param {Object} options      Options which configure how resource tests are rolled
   *
   * @returns {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
  async rollResource(resourceId, options = {}) {
    if (CTHACK.debug) console.log(`${LOG_HEAD}Roll resource ${resourceId}`);
    const label = game.i18n.localize(CTHACK.attributes[resourceId]);
    const resourceValue = this.system.attributes[resourceId].value;

    // Resource at 0
    if (resourceValue === "0") {
      return ui.notifications.warn(game.i18n.format("MACROS.ResourceAtZero", { resourceName: label }));
    }

    let title;

    if (resourceId != "miscellaneous") {
      title = game.i18n.format("CTHACK.ResourceRollPromptTitle", { resource: label });
    } else {
      if (game.settings.get("cthack", "MiscellaneousResource")) {
        title = game.i18n.format("CTHACK.ResourceRollPromptTitle", { resource: game.settings.get("cthack", "MiscellaneousResource") });
      } else {
        const resourceName = ame.i18n.format("CTHACK.Misc");
        title = game.i18n.format("CTHACK.ResourceRollPromptTitle", { resource: resourceName });
      }
    }

    // Roll and return
    const rollData = foundry.utils.mergeObject(options, {
      rollType: "Resource",
      title: title,
      rollId: title,
      diceType: resourceValue,
    });
    rollData.speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });

    let rollResource = await diceRoll(rollData);

    // Resource loss
    if (rollResource && (rollResource.total === 1 || rollResource.total === 2)) {
      await this.decreaseResource(resourceId);
    }
  }

  /**
   * Roll a Material dice
   * @param {Item} item         The item used for the roll
   * @param {Object} options      Options which configure how resource tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
  async rollMaterial(item, options = {}) {
    const dice = item.system.dice;

    if (CTHACK.debug) console.log(`${LOG_HEAD}Roll dice ${dice} for material ${item.name}`);

    // Material without resource
    if (item.system.dice === "") {
      return ui.notifications.warn(game.i18n.format("MACROS.ObjectWithoutResource", { itemName: item.name }));
    }
    // Material with resource at 0
    if (item.system.dice === "0") {
      return ui.notifications.warn(game.i18n.format("MACROS.ObjectEmptyResource", { itemName: item.name }));
    }

    const materialName = item.name;
    const message = game.i18n.format("CTHACK.MaterialRollDetails", { material: materialName });

    // Roll and return
    const rollData = foundry.utils.mergeObject(options, {
      rollType: "Material",
      title: game.i18n.format("CTHACK.MaterialRollPromptTitle") + " : " + item.name,
      rollId: message,
      diceType: dice,
    });
    rollData.speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });

    let rollMaterial = await diceRoll(rollData);

    // Resource loss
    if (rollMaterial && (rollMaterial.total === 1 || rollMaterial.total === 2)) {
      await this._decreaseMaterialResource(item.id, item.system.dice);
    }
  }

  /**
   * @name useAbility
   * @description 		Handles ability use
   * 						Decreases the usage left by 1
   * 						Display the time of the use
   * @public
   *
   * @param {*} ability   The ability item used
   *
   */

  useAbility(ability) {
    if (CTHACK.debug) console.log(`${LOG_HEAD}Use ability ${ability.name}`);
    let remaining = ability.system.uses.value;
    if (remaining === 0) {
      return;
    }
    if (remaining > 0) {
      remaining--;
    }
    const now = new Date();
    const lastTime = formatDate(now);
    ability.update({ "data.uses.value": remaining, "data.uses.last": lastTime });
  }

  /**
   * @name resetAbility
   * @description 		Handles ability reset
   * 						Reset usage to max
   * 						Reset the last time of the use
   * @public
   *
   * @param {*} ability   The ability item used
   *
   */

  resetAbility(ability) {
    if (CTHACK.debug) console.log(`${LOG_HEAD}Reset ability ${ability.name}`);
    ability.update({ "data.uses.value": ability.system.uses.max, "data.uses.last": "" });
  }

  /**
   * Decrease a material dice
   * @param {String} itemId   The id of the item
   * @param {String} dice   "d4""
   */
  async _decreaseMaterialResource(itemId, dice) {
    const newDiceValue = findLowerDice(dice);
    this.updateEmbeddedDocuments("Item", [{ _id: itemId, "data.dice": newDiceValue }]);
  }

  /**
   * Decrease a Resource dice
   * @param {String} resourceId   The resource ID (e.g. "smo")
   */
  async decreaseResource(resourceId) {
    if (CTHACK.debug) console.log(`${LOG_HEAD}Decrease resource ${resourceId}`);
    const actorResource = this.system.attributes[resourceId];

    // old value is 0 or dx
    let oldValue = actorResource.value;
    if (oldValue !== "0") {
      let newValue = findLowerDice(oldValue);
      actorResource.value = newValue;

      switch (resourceId) {
        case "flashlights":
          await this.update({ "system.attributes.flashlights": actorResource });
          break;
        case "smokes":
          await this.update({ "system.attributes.smokes": actorResource });
          break;
        case "sanity":
          await this.update({ "system.attributes.sanity": actorResource });
          break;
        case "miscellaneous":
          await this.update({ "system.attributes.miscellaneous": actorResource });
          break;
        case "wealthDice":
          await this.update({ "system.attributes.wealthDice": actorResource });
          break;
        case "hitDice":
          await this.update({ "system.attributes.hitDice": actorResource });
          break;
      }
    }
  }

  /**
   * Roll an armed or unarmed damage
   * @param {String} damageId     The damage ID (e.g. "armed" "unarmed")
   * @param {Object} options      Options which configure how damage tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
  async rollDamageRoll(damageId, options = {}) {
    if (CTHACK.debug) console.log(`${LOG_HEAD}Roll ${damageId} roll`);

    const damageDice = this.system.attributes[damageId].value;

    if (damageDice == 1) {
      return;
    }

    const damage = CTHACK.attributes[damageId];
    const label = game.i18n.localize(damage);

    // Roll and return
    const rollData = foundry.utils.mergeObject(options, {
      rollType: "Damage",
      title: label,
      rollId: label,
      diceType: damageDice,
    });
    rollData.speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });
    return await diceRoll(rollData);
  }

  /**
   * Roll an attack damage
   * @param {Item} item   		Item of type attack for opponent
   * @param {Object} options      Options which configure how damage tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
  async rollAttackDamageRoll(item, options = {}) {
    if (CTHACK.debug) console.log(`${LOG_HEAD}Attack roll for ${item.name} with a ${item.system.damageDice} dice`);

    const label = game.i18n.format("CTHACK.AttackDamageDiceRollPrompt", { item: item.name });

    // Custom Formula ?
    let isCustomFormula = false;

    // If there is a + in the formula, it's a custom Formula
    const count = item.system.damageDice.includes("+");
    if (count != null) isCustomFormula = true;

    // If the first character is not d, it's a custom Formula, 2d6 by exemple
    if (item.system.damageDice.charAt(0) !== "d") isCustomFormula = true;

    // Roll and return
    const rollData = foundry.utils.mergeObject(options, {
      rollType: "AttackDamage",
      title: label,
      rollId: label,
      diceType: isCustomFormula === false ? item.system.damageDice : null,
      customFormula: isCustomFormula === true ? item.system.damageDice : null,
    });
    rollData.speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });
    return await diceRoll(rollData);
  }

  /**
   *
   * @param {*} key
   * @param {*} itemId
   */
  async deleteAbility(key, itemId) {
    const index = this._findAbilityIndex(key, itemId);
    if (index !== -1) {
      let abilitiesList = this.system.abilities;
      abilitiesList.splice(index, 1);

      await this.update({ "system.abilities": abilitiesList });
    }
  }

  /**
   *
   * @param {*} key
   * @param {*} id
   * @returns
   */
  _findAbilityIndex(key, id) {
    let abilitiesList = this.system.abilities;
    let trouve = false;
    let index = -1;
    let i = 0;
    while (!trouve && i < abilitiesList.length) {
      if (key === abilitiesList[i].key) {
        trouve = true;
        index = i;
      }
      i++;
    }

    if (index === -1) {
      if (CTHACK.debug) console.log(`La capacité de clé ${key} n'a pas été trouvée dans la liste.`);
    }
    return index;
  }

  findSavesAdvantagesHTML(saveId) {
    let advantages = "<ul>";
    let advantagesArray = this.findSavesAdvantages(saveId);

    for (let index = 0; index < advantagesArray.length; index++) {
        advantages += `<li> ${advantagesArray[index].text} </li>`;
    }
    if (advantages === "<ul>") {
      advantages = "";
    } else advantages += "</ul>";
    return advantages;
  }
  

  findSavesAdvantages(saveId) {
    let advantages = [];

    // Check if the actor has the advantage from the standard abilities
    let abilitiesList = this.system.abilities;
    for (let index = 0; index < abilitiesList.length; index++) {
      const element = abilitiesList[index];
      if (element.key === "SWILEA" && (saveId === "str" || saveId === "dex" || saveId === "con")) {
        advantages.push({text: game.i18n.localize("CTHACK.AdvantageSWILEA"), origin: game.i18n.localize("CTHACK.StandardAbilities.SWILEA.label")});
      }
      if (element.key === "STA") {
        advantages.push({text: game.i18n.localize("CTHACK.AdvantageSTA"), origin: game.i18n.localize("CTHACK.StandardAbilities.STA.label")});
      }
      if (element.key === "ANIHAN") {
        advantages.push({text: game.i18n.localize("CTHACK.AdvantageANIHAN"), origin: game.i18n.localize("CTHACK.StandardAbilities.ANIHAN.label")});
      }
      if (element.key === "IND" && (saveId === "wis" || saveId === "int" || saveId === "cha")) {
        advantages.push({text: game.i18n.localize("CTHACK.AdvantageIND"), origin: game.i18n.localize("CTHACK.StandardAbilities.IND.label")});
      }
      if (element.key === "MEC") {
        advantages.push({text: game.i18n.localize("CTHACK.AdvantageMEC"), origin: game.i18n.localize("CTHACK.StandardAbilities.MEC.label")});
      }
      if (element.key === "IROMIN") {
        advantages.push({text: game.i18n.localize("CTHACK.AdvantageIROMIN"), origin: game.i18n.localize("CTHACK.StandardAbilities.IROMIN.label")});
      }
      if (element.key === "RIP" && saveId === "str") {
        advantages.push({text: game.i18n.localize("CTHACK.AdvantageRIP"), origin: game.i18n.localize("CTHACK.StandardAbilities.RIP.label")});
      }
      if (element.key === "LEG") {
        advantages.push({text: game.i18n.localize("CTHACK.AdvantageLEG"), origin: game.i18n.localize("CTHACK.StandardAbilities.LEG.label")});
      }
      if (element.key === "SELPRE") {
        advantages.push({text: game.i18n.localize("CTHACK.AdvantageSELPRE"), origin: game.i18n.localize("CTHACK.StandardAbilities.SELPRE.label")});
      }
      if (element.key === "HAR") {
        advantages.push({text: game.i18n.localize("CTHACK.AdvantageHAR"), origin: game.i18n.localize("CTHACK.StandardAbilities.HAR.label")});
      }
    }

    // Check if the actor has the advantage from the custom abilities
    const customAdvantages = this._findSavesAdvantagesFromCustomAbilities();
    if (customAdvantages.length > 0) {
      advantages.push(...customAdvantages);
    }

    return advantages;
  }

  /**
   * @name _findSavesAdvantagesFromCustomAbilities
   * @private
   *
   * @description Find advantages given by custom abilitites
   *
   * @returns
   */
  _findSavesAdvantagesFromCustomAbilities() {
    let customAdvantages = [];
    this.items.forEach((element) => {
      if (element.type === "ability" && element.system.isCustom && element.system.advantageGiven && element.system.advantageText !== "") {
        customAdvantages.push({text: element.system.advantageText, origin: element.name});
      }
    });
    return customAdvantages;
  }

  /**
   * Create a definition item with the active effect if necessary
   * @param {*} itemData
   */
  async createDefinitionItem(itemData) {
    if (itemData.system.key === "OOA-CRB" || itemData.system.key === "OOA-MIC" || itemData.system.key === "OOA-STA" || itemData.system.key === "OOA-WIN") {
      this._createActiveEffect(itemData);
    } else if (itemData.system.key.startsWith("OOA") || itemData.system.key.startsWith("TI") || itemData.system.key.startsWith("SK")) {
      this._createActiveEffect(itemData);
    }

    // Create the owned item
    return this.createEmbeddedDocuments("Item", [itemData], { renderSheet: true });
  }

  /**
   *
   * @param {*} itemData
   */
  async _createActiveEffect(itemData) {
    if (CTHACK.debug) console.log(`CTHACK | Create active Effect with itemData ${itemData}`);

    let effectData;

    if (itemData.system.key === "OOA-CRB") {
      effectData = {
        label: "OOA-CRB",
        icon: "systems/cthack/ui/icons/first-aid-kit.png",
        changes: [
          {
            key: "data.saves.str.value",
            mode: 2,
            value: -4,
            priority: "20",
          },
          {
            key: "data.saves.dex.value",
            mode: 2,
            value: -4,
            priority: "20",
          },
          {
            key: "data.saves.con.value",
            mode: 2,
            value: -4,
            priority: "20",
          },
        ],
        duration: {
          seconds: 3600,
        },
        tint: "#BB0022",
      };
    } else if (itemData.system.key === "OOA-MIC") {
      effectData = {
        label: "OOA-MIC",
        icon: "systems/cthack/ui/icons/first-aid-kit.png",
        duration: {
          seconds: 1200,
        },
        tint: "#BB0022",
      };
      await this.setFlag("cthack", "disadvantageOOA", true);
    } else if (itemData.system.key === "OOA-STA") {
      effectData = {
        label: "OOA-STA",
        icon: "systems/cthack/ui/icons/first-aid-kit.png",
        duration: {
          seconds: 600,
        },
        tint: "#BB0022",
      };
      await this.setFlag("cthack", "disadvantageOOA", true);
    } else if (itemData.system.key === "OOA-WIN") {
      effectData = {
        label: "OOA-WIN",
        icon: "systems/cthack/ui/icons/first-aid-kit.png",
        duration: {
          seconds: 60,
        },
        tint: "#BB0022",
      };
      await this.setFlag("cthack", "disadvantageOOA", true);
    } else if (itemData.system.key.startsWith("OOA")) {
      effectData = {
        label: itemData.system.key,
        icon: "systems/cthack/ui/icons/first-aid-kit.png",
        duration: {
          seconds: 3600,
        },
        tint: "#BB0022",
      };
    } else if (itemData.system.key.startsWith("TI")) {
      effectData = {
        label: itemData.system.key,
        icon: "systems/cthack/ui/icons/screaming.png",
        duration: {
          seconds: 3600,
        },
        tint: "#BB0022",
      };
    } else if (itemData.system.key.startsWith("SK")) {
      effectData = {
        label: itemData.system.key,
        icon: "systems/cthack/ui/icons/dead-head.png",
        duration: {
          seconds: 3600,
        },
        tint: "#BB0022",
      };
    }

    // Create the Active Effect
    this.createEmbeddedDocuments("ActiveEffect", [effectData]);
  }

  /**
   * @name deleteEffectFromItem
   *
   * @description Delete the associated active effect of a definition item if necessary
   *
   * @param {*} item
   */
  async deleteEffectFromItem(item) {
    // Delete the Active Effect
    let effect;
    const definitionKey = item.system.key;
    if (CTHACK.debug) console.log("CTHACK | deleteDefinitionItem : definitionKey = " + definitionKey);
    if (definitionKey === "OOA-CRB") {
      effect = this.effects.find((i) => i.name === definitionKey);
      if (CTHACK.debug) console.log("CTHACK | Delete Active Effect : " + effect._id);
      await this.deleteEmbeddedDocuments("ActiveEffect", [effect._id]);
    } else if (definitionKey === "OOA-MIC" || definitionKey === "OOA-STA" || definitionKey === "OOA-WIN") {
      effect = this.effects.find((i) => i.name === definitionKey);
      if (CTHACK.debug) console.log("CTHACK | Delete Active Effect : " + effect._id);
      await this.deleteEmbeddedDocuments("ActiveEffect", [effect._id]);
      await this.unsetFlag("cthack", "disadvantageOOA");
    } else if (definitionKey.startsWith("OOA")) {
      effect = this.effects.find((i) => i.name === definitionKey);
      if (CTHACK.debug) console.log("CTHACK | Delete Active Effect : " + effect._id);
      await this.deleteEmbeddedDocuments("ActiveEffect", [effect._id]);
    } else if (definitionKey.startsWith("TI")) {
      effect = this.effects.find((i) => i.name === definitionKey);
      if (CTHACK.debug) console.log("CTHACK | Delete Active Effect : " + effect._id);
      await this.deleteEmbeddedDocuments("ActiveEffect", [effect._id]);
    } else if (definitionKey.startsWith("SK")) {
      effect = this.effects.find((i) => i.name === definitionKey);
      if (CTHACK.debug) console.log("CTHACK | Delete Active Effect : " + effect._id);
      await this.deleteEmbeddedDocuments("ActiveEffect", [effect._id]);
    }
  }

  /**
   * @name getAvailableAttributes
   * @description Get attributes for an actor
   *              Depends on settings
   * 				Don't return adrenaline1 and adrenaline2
   * 				Used for the module Token Action HUD
   * @public
   *
   * @returns 	An array (key/values) of available attributes
   */
  getAvailableAttributes() {
    let availableAttributes = Object.entries(this.system.attributes).filter(function (a) {
      if (a[0] === "adrenaline1" || a[0] === "adrenaline2") {
        return false;
      }
      if (a[0] === "hitDice" && !game.settings.get("cthack", "HitDiceResource")) {
        return false;
      }
      if (a[0] === "wealthDice" && (!game.settings.get("cthack", "Wealth") || game.settings.get("cthack", "MiscellaneousResource") !== "")) {
        return false;
      }
      if (a[0] === "miscellaneous" && game.settings.get("cthack", "MiscellaneousResource") === "") {
        return false;
      }
      return true;
    });

    return availableAttributes;
  }

  get isUnlocked() {
    if (this.getFlag(game.system.id, "SheetUnlocked")) return true;
    return false;
  }

  get hasImage() {
    return this.img && this.img !== "icons/svg/mystery-man.svg";
  }
}
