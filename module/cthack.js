// Import Modules
import { CTHACK } from "./config.js";
import { registerHandlebarsHelpers } from "./helpers.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { registerSystemSettings } from "./settings.js";

import { CtHackActor } from "./actor/actor.js";
import { CtHackActorSheet } from "./actor/actor-sheet.js";
import { CtHackItem } from "./item/item.js";
import { CtHackItemSheet } from "./item/item-sheet.js";

Hooks.once('init', async function() {

  console.log(`CTHACK | Initializing the Cthulhu Hack Game System\n`);
  console.log(CTHACK.ASCII);

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
  Items.registerSheet("cthack", CtHackItemSheet, { types: ["item", "weapon", "archetype", "ability"], makeDefault: true });

  // Preload Handlebars Templates
  preloadHandlebarsTemplates();

  // Register Handlebars Helpers
  registerHandlebarsHelpers();

  // Register System Settings
  registerSystemSettings();

});