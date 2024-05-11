// Import Modules
import { CTHACK } from "./config.js";
import { SYSTEM_NAME, LOG_HEAD, DEV_MODE } from "./constants.js";
import { registerHandlebarsHelpers } from "./helpers.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { registerSystemSettings } from "./settings.js";
import { CthackUtils } from "./utils.js";
import { Macros } from "./macros.js";
import { registerHooks } from "./hooks.js";
import { GMManager } from "./applications/gm/gm-manager.js";
import { initControlButtons } from "./control-buttons.js";

import { SYSTEM } from "./config/system.mjs";

globalThis.SYSTEM = SYSTEM;

// Import modules
import * as models from "./data/_module.mjs";
import * as applications from "./applications/_module.mjs";
import * as documents from "./documents/_module.mjs";

export default class FullsearchJournalSheet extends JournalSheet {}

Hooks.once("init", async function () {
  console.log(LOG_HEAD + game.i18n.localize("CTHACK.Logs.InitStart"));
  console.log(CTHACK.ASCII);

  game.system.CONST = SYSTEM;
  
  game.cthack = {
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
  CONFIG.Actor.documentClass = documents.CtHackActor;
  CONFIG.Actor.dataModels = {
    character: models.CtHackCharacter,
    opponent: models.CtHackOpponent
  }

  CONFIG.Item.documentClass = documents.CtHackItem;
  CONFIG.Item.dataModels = {
    ability: models.CtHackAbility,
    archetype: models.CtHackArchetype,
    attack: models.CtHackAttack,
    definition: models.CtHackDefinition,
    item: models.CtHackItem,
    magic: models.CtHackMagic,
    weapon: models.CtHackWeapon,
    opponentAbility: models.CtHackOpponentAbility
  };

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet(SYSTEM_NAME, applications.PersonnageSheet, { types: ["character"], makeDefault: true, label: "CTHACK.SheetClassCharacter" });
  Actors.registerSheet(SYSTEM_NAME, applications.AdversaireSheet, { types: ["opponent"], makeDefault: true, label: "CTHACK.SheetClassOpponent" });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet(SYSTEM_NAME, applications.CapaciteSheet, { types: ["ability"], makeDefault: true });
  Items.registerSheet(SYSTEM_NAME, applications.ObjetSheet, { types: ["item"], makeDefault: true });
  Items.registerSheet(SYSTEM_NAME, applications.ArmeSheet, { types: ["weapon"], makeDefault: true });
  Items.registerSheet(SYSTEM_NAME, applications.MagieSheet, { types: ["magic"], makeDefault: true });
  Items.registerSheet(SYSTEM_NAME, applications.ArchetypeSheet, { types: ["archetype"], makeDefault: true });
  Items.registerSheet(SYSTEM_NAME, applications.AttaqueSheet, { types: ["attack"], makeDefault: true });
  Items.registerSheet(SYSTEM_NAME, applications.AdversaireCapaciteSheet, { types: ["opponentAbility"], makeDefault: true });
  Items.registerSheet(SYSTEM_NAME, applications.DefinitionSheet, { types: ["definition"], makeDefault: true });

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

  // Search
  Journal.registerSheet(game.system.id, FullsearchJournalSheet, { makeDefault: false });

  console.log(LOG_HEAD + game.i18n.localize("CTHACK.Logs.InitEnd"));
});

// Register world usage statistics
function registerWorldCount(registerKey) {
  if (game.user.isGM) {
    let worldKey = game.settings.get(registerKey, "worldKey");
    if (worldKey == undefined || worldKey == "") {
      worldKey = randomID(32);
      game.settings.set(registerKey, "worldKey", worldKey);
    }

    // Simple API counter
    const worldData = {
      register_key: registerKey,
      world_key: worldKey,
      foundry_version: `${game.release.generation}.${game.release.build}`,
      system_name: game.system.id,
      system_version: game.system.version,
    };

    let apiURL = "https://worlds.qawstats.info/worlds-counter";
    $.ajax({
      url: apiURL,
      type: "POST",
      data: JSON.stringify(worldData),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      async: false,
    });
  }
}

Hooks.once("ready", async function () {
  if (!DEV_MODE) {
    registerWorldCount("cthack");
  }

  console.log(LOG_HEAD + game.i18n.localize("CTHACK.Logs.ReadyEnd"));
});
