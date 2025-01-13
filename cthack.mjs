// Import Modules
import { CTHACK } from "./module/config.mjs"
import { SYSTEM_NAME, LOG_HEAD, DEV_MODE } from "./module/constants.mjs"
import { registerHandlebarsHelpers } from "./module/helpers.mjs"
import { preloadHandlebarsTemplates } from "./module/templates.mjs"
import { registerSystemSettings } from "./module/settings.mjs"
import { CthackUtils } from "./module/utils.mjs"
import { Macros } from "./module/macros.mjs"
import { registerHooks } from "./module/hooks.mjs"
import { GMManager } from "./module/applications/gm/gm-manager.mjs"
import { initControlButtons } from "./module/control-buttons.mjs"
import { setupTextEnrichers } from "./module/enrichers.mjs"

import { SYSTEM } from "./module/config/system.mjs"

globalThis.SYSTEM = SYSTEM

// Import modules
import * as models from "./module/data/_module.mjs"
import * as applications from "./module/applications/_module.mjs"
import * as documents from "./module/documents/_module.mjs"

export default class FullsearchJournalSheet extends JournalSheet {}

Hooks.once("init", async function () {
  console.log(LOG_HEAD + "Initialization of Cthulhu Hack system")
  console.log(CTHACK.ASCII)

  globalThis.cthack = game.system
  game.system.CONST = SYSTEM

  // Expose the system API
  game.system.api = {
    applications,
    models,
    documents,
  }

  game.cthack = {
    macros: Macros,
  }

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d20",
    decimals: 2,
  }

  // Define socket
  game.socket.on("system.cthack", (data) => {
    CthackUtils.performSocketMesssage(data)
  })

  CONFIG.CTHACK = CTHACK

  // Define custom Entity classes
  CONFIG.Actor.documentClass = documents.CtHackActor
  CONFIG.Actor.dataModels = {
    character: models.CtHackCharacter,
    opponent: models.CtHackOpponent,
  }

  CONFIG.Item.documentClass = documents.CtHackItem
  CONFIG.Item.dataModels = {
    ability: models.CtHackAbility,
    archetype: models.CtHackArchetype,
    attack: models.CtHackAttack,
    definition: models.CtHackDefinition,
    item: models.CtHackItem,
    magic: models.CtHackMagic,
    weapon: models.CtHackWeapon,
    opponentAbility: models.CtHackOpponentAbility,
  }

  CONFIG.Actor.compendiumBanner = "systems/cthack/ui/cthulhu-hack-banner.webp"
  CONFIG.Item.compendiumBanner = "systems/cthack/ui/cthulhu-hack-banner.webp"
  CONFIG.JournalEntry.compendiumBanner = "systems/cthack/ui/cthulhu-hack-banner.webp"
  CONFIG.RollTable.compendiumBanner = "systems/cthack/ui/cthulhu-hack-banner.webp"
  CONFIG.Scene.compendiumBanner = "systems/cthack/ui/cthulhu-hack-banner.webp"
  CONFIG.Macro.compendiumBanner = "systems/cthack/ui/cthulhu-hack-banner.webp"

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet)
  Actors.registerSheet(SYSTEM_NAME, applications.PersonnageSheet, { types: ["character"], makeDefault: true })
  Actors.registerSheet(SYSTEM_NAME, applications.AdversaireSheet, { types: ["opponent"], makeDefault: true })

  Items.unregisterSheet("core", ItemSheet)
  Items.registerSheet(SYSTEM_NAME, applications.CapaciteSheet, { types: ["ability"], makeDefault: true })
  Items.registerSheet(SYSTEM_NAME, applications.ObjetSheet, { types: ["item"], makeDefault: true })
  Items.registerSheet(SYSTEM_NAME, applications.ArmeSheet, { types: ["weapon"], makeDefault: true })
  Items.registerSheet(SYSTEM_NAME, applications.MagieSheet, { types: ["magic"], makeDefault: true })
  Items.registerSheet(SYSTEM_NAME, applications.ArchetypeSheet, { types: ["archetype"], makeDefault: true })
  Items.registerSheet(SYSTEM_NAME, applications.AttaqueSheet, { types: ["attack"], makeDefault: true })
  Items.registerSheet(SYSTEM_NAME, applications.AdversaireCapaciteSheet, { types: ["opponentAbility"], makeDefault: true })
  Items.registerSheet(SYSTEM_NAME, applications.DefinitionSheet, { types: ["definition"], makeDefault: true })

  // Dice system configuration
  CONFIG.Dice.rolls.push(documents.CtHackRoll)

  // Preload Handlebars Templates
  preloadHandlebarsTemplates()

  // Register Handlebars Helpers
  registerHandlebarsHelpers()

  // Register System Settings
  registerSystemSettings()

  // Register Hooks
  registerHooks()

  // Init new buttons for the system
  initControlButtons()

  // Setup Text Enrichers
  setupTextEnrichers()

  // Other Document Configuration
  const v2 = game.settings.get("cthack", "Revised") ? true : false
  if (v2) {
    CONFIG.ChatMessage.documentClass = documents.CtHackChatMessage
  }

  // Search
  Journal.registerSheet(game.system.id, FullsearchJournalSheet, { makeDefault: false })

  console.log(LOG_HEAD + "Cthulhu Hack system initialized")
})

// Register world usage statistics
function registerWorldCount(registerKey) {
  if (game.user.isGM) {
    let worldKey = game.settings.get(registerKey, "worldKey")
    if (worldKey == undefined || worldKey == "") {
      worldKey = foundry.utils.randomID(32)
      game.settings.set(registerKey, "worldKey", worldKey)
    }

    // Simple API counter
    const worldData = {
      register_key: registerKey,
      world_key: worldKey,
      foundry_version: `${game.release.generation}.${game.release.build}`,
      system_name: game.system.id,
      system_version: game.system.version,
    }

    let apiURL = "https://worlds.qawstats.info/worlds-counter"
    $.ajax({
      url: apiURL,
      type: "POST",
      data: JSON.stringify(worldData),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      async: false,
    })
  }
}

Hooks.once("ready", async function () {
  if (!DEV_MODE) {
    registerWorldCount("cthack")
  }

  // Game Manager
  game.cthack.gmManager = new GMManager()
  if (game.user.isGM) {
    game.cthack.gmManager.render(true)
  }

  console.log(LOG_HEAD + game.i18n.localize("CTHACK.Logs.ReadyEnd"))
})
