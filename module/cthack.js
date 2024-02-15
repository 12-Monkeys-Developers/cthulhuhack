// Import Modules
import { CTHACK } from "./config.js";
import { SYSTEM_NAME, LOG_HEAD, DEV_MODE } from "./constants.js";
import { registerHandlebarsHelpers } from "./helpers.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { registerSystemSettings } from "./settings.js";
import { CthackUtils } from "./utils.js";

import { CtHackActor } from "./actor/actor.js";
import { CtHackActorSheet } from "./actor/actor-sheet.js";
import { CtHackOpponentSheet } from "./actor/opponent-sheet.js";
import { CtHackItem } from "./item/item.js";
import { CtHackItemSheet } from "./item/item-sheet.js";
import { CtHackArchetypeSheet } from "./item/archetype-sheet.js";
import { CtHackMagicSheet } from "./item/magic-sheet.js";

import { Macros } from "./macros.js";
import { registerHooks } from "./hooks.js";

import { GMManager } from "./app/gm-manager.js";
import { initControlButtons } from "./control-buttons.js";

import { CtHackOpponentSheetV2 } from "./actor/opponent-sheet-2.js";

Hooks.once("init", async function () {
  console.log(LOG_HEAD + 'Initialisation du système Cthulhu Hack');
  console.log(CTHACK.ASCII);

  game.cthack = {
    CtHackActor,
    CtHackItem,
    config: CTHACK,
    macros: Macros,
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d20",
    decimals: 2,
  };

  // Define socket
  game.socket.on("system.cthack", (data) => {
    CthackUtils.performSocketMesssage(data);
  });

  CONFIG.CTHACK = CTHACK;

  // Define custom Entity classes
  CONFIG.Actor.documentClass = CtHackActor;
  CONFIG.Item.documentClass = CtHackItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet(SYSTEM_NAME, CtHackActorSheet, { types: ["character"], makeDefault: true, label: "CTHACK.SheetClassCharacter" });
  Actors.registerSheet(SYSTEM_NAME, CtHackOpponentSheet, { types: ["opponent"], makeDefault: true, label: "CTHACK.SheetClassOpponent" });
  Actors.registerSheet(SYSTEM_NAME, CtHackOpponentSheetV2, { types: ["opponent"], label: "Adversaire v2" });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet(SYSTEM_NAME, CtHackItemSheet, { types: ["item", "weapon", "attack", "ability", "definition"], makeDefault: true, label: "CTHACK.SheetClassItem" });
  Items.registerSheet(SYSTEM_NAME, CtHackArchetypeSheet, { types: ["archetype"], makeDefault: true, label: "CTHACK.SheetClassItem" });
  Items.registerSheet(SYSTEM_NAME, CtHackMagicSheet, { types: ["magic"], makeDefault: true, label: "CTHACK.SheetClassItem" });

  // Preload Handlebars Templates
  preloadHandlebarsTemplates();

  // Register Handlebars Helpers
  registerHandlebarsHelpers();

  // Register System Settings
  registerSystemSettings();

  // Register Hooks
  registerHooks();

  // Init new buttons for the system
  initControlButtons();

  // Game Manager
  game.cthack.gmManager = new GMManager();

  console.log(LOG_HEAD + 'Système Cthulhu Hack initialisé');
});

// Register world usage statistics
function registerWorldCount(registerKey) {
  if (game.user.isGM) {
    let worldKey = game.settings.get(registerKey,"worldKey");
    if (worldKey == undefined || worldKey == "") {
      worldKey = randomID(32);
      game.settings.set(registerKey, "worldKey", worldKey);
    }

    // Simple API counter
	const worldData = {
		"register_key": registerKey,
		"world_key": worldKey,
		"foundry_version": `${game.release.generation}.${game.release.build}`,
		"system_name": game.system.id,
		"system_version": game.system.version
	}

    let apiURL = "https://worlds.qawstats.info/worlds-counter";
    $.ajax({
		url: apiURL,
		type: 'POST',
		data: JSON.stringify(worldData),
		contentType: 'application/json; charset=utf-8',
    dataType: 'json',
		async: false
	  });
  }
}

Hooks.once("ready", async function() {
  // console.log(LOG_HEAD + 'Système Cthulhu Hack Ready - Start');
  if (!DEV_MODE) {
    registerWorldCount('cthack');
  }
  console.log(LOG_HEAD + 'Système Cthulhu Hack Ready - Finished');
});
