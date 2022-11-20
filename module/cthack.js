// Import Modules
import { CTHACK } from './config.js';
import { SYSTEM_NAME, LOG_HEAD } from './constants.js';
import { registerHandlebarsHelpers } from './helpers.js';
import { preloadHandlebarsTemplates } from './templates.js';
import { registerSystemSettings } from './settings.js';
import { CthackUtils } from './utils.js';

import { CtHackActor } from './actor/actor.js';
import { CtHackActorSheet } from './actor/actor-sheet.js';
import { CtHackOpponentSheet } from './actor/opponent-sheet.js';
import { CtHackItem } from './item/item.js';
import { CtHackItemSheet } from './item/item-sheet.js';
import { CtHackArchetypeSheet } from './item/archetype-sheet.js';

import { Macros } from './macros.js';
import { registerHooks } from './hooks.js';

import { GMManager } from './app/gm-manager.js';
import { initControlButtons } from './control-buttons.js';

Hooks.once('init', async function() {
	console.log(LOG_HEAD + 'Initializing the Cthulhu Hack Game System');
	console.log(CTHACK.ASCII);

	game.cthack = {
		CtHackActor,
		CtHackItem,
		config: CTHACK,
		macros: Macros
	};

	/**
   * Set an initiative formula for the system
   * @type {String}
   */
	CONFIG.Combat.initiative = {
		formula: '1d20',
		decimals: 2
	};

	// Define socket
	game.socket.on('system.cthack', (data) => {
		CthackUtils.performSocketMesssage(data);
	});

	CONFIG.CTHACK = CTHACK;

	// Define custom Entity classes
	CONFIG.Actor.documentClass = CtHackActor;
	CONFIG.Item.documentClass = CtHackItem;

	// Register sheet application classes
	Actors.unregisterSheet('core', ActorSheet);
	Actors.registerSheet(SYSTEM_NAME, CtHackActorSheet, { types: [ 'character' ], makeDefault: true, label: 'CTHACK.SheetClassCharacter' });
	Actors.registerSheet(SYSTEM_NAME, CtHackOpponentSheet, { types: [ 'opponent' ], makeDefault: true, label: 'CTHACK.SheetClassOpponent' });
	Items.unregisterSheet('core', ItemSheet);
	Items.registerSheet(SYSTEM_NAME, CtHackItemSheet, { types: [ 'item', 'weapon', 'attack', 'ability', 'definition' ], makeDefault: true, label: 'CTHACK.SheetClassItem' });
	Items.registerSheet(SYSTEM_NAME, CtHackArchetypeSheet, { types: [ 'archetype' ], makeDefault: true, label: 'CTHACK.SheetClassItem' });

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

	console.log(LOG_HEAD + 'Cthulhu Hack Game System initialized');
});
