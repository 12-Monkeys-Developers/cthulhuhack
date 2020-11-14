// Import Modules
import { CTHACK } from "./config.js"

import { CtHackActor } from "./actor/actor.js";
import { CtHackActorSheet } from "./actor/actor-sheet.js";
import { CtHackItem } from "./item/item.js";
import { CtHackItemSheet } from "./item/item-sheet.js";

Hooks.once('init', async function() {

  console.log(`CTHACK | Initializing the Cthulhu Hack Game System\n${CTHACK.ASCII}`);

  game.cthack = {
    CtHackActor,
    CtHackItem
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d20",
    decimals: 2
  };

  // Define custom Entity classes
  CONFIG.Actor.entityClass = CtHackActor;
  CONFIG.Item.entityClass = CtHackItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cthack", CtHackActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cthack", CtHackItemSheet, { makeDefault: true });

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper('toAbbr', function(str) {
    var outStr = 'CTHACK.Ability' + str.substring(0,1).toUpperCase() + str.substring(1) + 'Abbr';
    return outStr;
  });

});