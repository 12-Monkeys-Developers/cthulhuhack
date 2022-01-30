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

import { Macros } from "./macros.js";

// Import Helpers
import * as chat from "./chat.js";

import { GMManager } from './app/gm-manager.js';
//import { Die4Cthack, Die6Cthack } from './dice.js';

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

	// Game Manager
	game.cthack.gmManager = new GMManager();

	//CONFIG.Dice.terms["c"] = DieCthack;

});

Hooks.on('renderChatMessage', async (app, html, data) => {
	chat.highlightSuccessFailure(app, html, data);
});

Hooks.once("setup", function() {

	// Localize CONFIG objects once up-front
	const toLocalize = ["saves","attributes"];
	// Exclude some from sorting where the default order matters
	const noSort = ["saves","attributes"];

	// Localize and sort CONFIG objects
	for ( let o of toLocalize ) {
		const localized = Object.entries(CONFIG.CTHACK[o]).map(e => {
		  return [e[0], game.i18n.localize(e[1])];
		});
		if ( !noSort.includes(o) ) localized.sort((a, b) => a[1].localeCompare(b[1]));
		CONFIG.CTHACK[o] = localized.reduce((obj, e) => {
		  obj[e[0]] = e[1];
		  return obj;
		}, {});
	}
});

/**
 * Create a macro when dropping an entity on the hotbar
 * Item      - open roll dialog 
 * Actor     - open actor sheet
 * Journal   - open journal sheet
 */
Hooks.on("hotbarDrop", async (bar, data, slot) => {
	// Create macro depending of the item dropped on the hotbar
	if (data.type == "Item") {
		const item = data.data;
		let command;
		let macro;

		// Item or weapon for character
		if (item.type === "item" || item.type === "weapon") {
			command = `game.cthack.macros.rollItemMacro("${item._id}", "${item.name}");`;
			macro = game.macros.contents.find(m => (m.name === item.name) && (m.data.command === command));
			if (!macro) {
				macro = await Macro.create({
					name: item.name,
					type : "script",
					img: item.img,
					command : command
				}, {displaySheet: false});
				game.user.assignHotbarMacro(macro, slot);
			}

		}

		// Attack for opponent
		else if (item.type === "attack") {
			command = `game.cthack.macros.rollAttackMacro("${item._id}", "${item.name}");`;
			macro = game.macros.contents.find(m => (m.name === item.name) && (m.data.command === command));
			if (!macro) {
				macro = await Macro.create({
					name: item.name,
					type : "script",
					img: item.img,
					command : command
				}, {displaySheet: false});
				game.user.assignHotbarMacro(macro, slot);
			}
		}

		// Ability
		else if (item.type === "ability") {
			const maxUses = item.data.uses.max;
			if (maxUses === null) {
				return ui.notifications.warn(game.i18n.format('MACROS.AbilityWithoutUsage',{itemName: item.name}));
			}

			command = `game.cthack.macros.useAbilityMacro("${item._id}", "${item.name}");`;
			macro = game.macros.contents.find(m => (m.name === item.name) && (m.data.command === command));
			if (!macro) {
				macro = await Macro.create({
					name: item.name,
					type : "script",
					img: item.img,
					command : command
				}, {displaySheet: false});
				game.user.assignHotbarMacro(macro, slot);
			}
		}
	}

	// Creates a macro to open the actor sheet of the actor dropped on the hotbar
	else if (data.type == "Actor") {
		let actor = game.actors.get(data.id);
		let command = `game.actors.get("${data.id}").sheet.render(true)`
		let macro = game.macros.contents.find(m => (m.name === actor.name) && (m.data.command === command));
		if (!macro) {
			macro = await Macro.create({
				name: actor.data.name,
				type: "script",
				img: actor.data.img,
				command: command
			}, {displaySheet: false})
			game.user.assignHotbarMacro(macro, slot);
		}
	}

	// Creates a macro to open the journal sheet of the journal dropped on the hotbar
	else if (data.type == "JournalEntry") {
		let journal = game.journal.get(data.id);
		let command = `game.journal.get("${data.id}").sheet.render(true)`
		let macro = game.macros.contents.find(m => (m.name === journal.name) && (m.data.command === command));
		if (!macro) {
			macro = await Macro.create({
				name: journal.data.name,
				type: "script",
				img: (journal.data.img) ? journal.data.img : "icons/svg/book.svg",
				command: command
			}, {displaySheet: false})
			game.user.assignHotbarMacro(macro, slot);
		}
	}
});

/*
Hooks.on("renderPause", (_app, html) => {
	html.find("img").attr("src", "systems/cthack/ui/cthack-logo.webp");
});
*/

// Dice-so-nice Ready
Hooks.once('diceSoNiceReady', (dice3d) => {
		/*Die6Cthack.diceSoNiceReady(dice3d);
		Die4Cthack.diceSoNiceReady(dice3d);
		*/

		dice3d.addSystem({id: "cthack", name: "Cthulhu Hack"}, "preferred");

		dice3d.addColorset({
			name: 'cthack',
			description: "Cthulhu Hack Default",
			category: "Cthulhu Hack",
			foreground: '#000000',
			background: "#000000",
			texture: 'none',
			edge: '#000000',
			material: 'plastic',
			visibility: 'visible'
		},"preferred");		

		dice3d.addDicePreset({
            type: "d4",
            labels: [
                "systems/cthack/ui/dice/d4/d4-1.webp",
                "systems/cthack/ui/dice/d4/d4-2.webp",
                "systems/cthack/ui/dice/d4/d4-3.webp",
                "systems/cthack/ui/dice/d4/d4-4.webp",
            ],
            system: "cthack"
        });

		dice3d.addDicePreset({
            type: "d6",
            labels: [
                "systems/cthack/ui/dice/d6/d6-1.webp",
                "systems/cthack/ui/dice/d6/d6-2.webp",
                "systems/cthack/ui/dice/d6/d6-3.webp",
                "systems/cthack/ui/dice/d6/d6-4.webp",
                "systems/cthack/ui/dice/d6/d6-5.webp",
                "systems/cthack/ui/dice/d6/d6-6.webp"
            ],
            system: "cthack"
        });	

		dice3d.addDicePreset({
            type: "d8",
            labels: [
                "systems/cthack/ui/dice/d8/d8-1.webp",
                "systems/cthack/ui/dice/d8/d8-2.webp",
                "systems/cthack/ui/dice/d8/d8-3.webp",
                "systems/cthack/ui/dice/d8/d8-4.webp",
				"systems/cthack/ui/dice/d8/d8-5.webp",
				"systems/cthack/ui/dice/d8/d8-6.webp",
				"systems/cthack/ui/dice/d8/d8-7.webp",
				"systems/cthack/ui/dice/d8/d8-8.webp"
            ],
            system: "cthack"
        });

		dice3d.addDicePreset({
            type: "d10",
            labels: [
                "systems/cthack/ui/dice/d10/d10-1.webp",
                "systems/cthack/ui/dice/d10/d10-2.webp",
                "systems/cthack/ui/dice/d10/d10-3.webp",
                "systems/cthack/ui/dice/d10/d10-4.webp",
				"systems/cthack/ui/dice/d10/d10-5.webp",
				"systems/cthack/ui/dice/d10/d10-6.webp",
				"systems/cthack/ui/dice/d10/d10-7.webp",
                "systems/cthack/ui/dice/d10/d10-8.webp",
				"systems/cthack/ui/dice/d10/d10-9.webp",
				"systems/cthack/ui/dice/d10/d10-10.webp"
            ],
            system: "cthack"
        });

		dice3d.addDicePreset({
            type: "d12",
            labels: [
                "systems/cthack/ui/dice/d20/d20-1.webp",
                "systems/cthack/ui/dice/d20/d20-2.webp",
                "systems/cthack/ui/dice/d20/d20-3.webp",
                "systems/cthack/ui/dice/d20/d20-4.webp",
                "systems/cthack/ui/dice/d20/d20-5.webp",
				"systems/cthack/ui/dice/d20/d20-6.webp",
				"systems/cthack/ui/dice/d20/d20-7.webp",
				"systems/cthack/ui/dice/d20/d20-8.webp",
				"systems/cthack/ui/dice/d20/d20-9.webp",
				"systems/cthack/ui/dice/d20/d20-10.webp",
				"systems/cthack/ui/dice/d20/d20-11.webp",
				"systems/cthack/ui/dice/d20/d20-12.webp",
            ],
            system: "cthack"
        });	

		dice3d.addDicePreset({
            type: "d20",
            labels: [
                "systems/cthack/ui/dice/d20/d20-1.webp",
                "systems/cthack/ui/dice/d20/d20-2.webp",
				"systems/cthack/ui/dice/d20/d20-3.webp",
				"systems/cthack/ui/dice/d20/d20-4.webp",
				"systems/cthack/ui/dice/d20/d20-5.webp",
				"systems/cthack/ui/dice/d20/d20-6.webp",
				"systems/cthack/ui/dice/d20/d20-7.webp",
				"systems/cthack/ui/dice/d20/d20-8.webp",
				"systems/cthack/ui/dice/d20/d20-9.webp",
				"systems/cthack/ui/dice/d20/d20-10.webp",
				"systems/cthack/ui/dice/d20/d20-11.webp",
				"systems/cthack/ui/dice/d20/d20-12.webp",
				"systems/cthack/ui/dice/d20/d20-13.webp",
				"systems/cthack/ui/dice/d20/d20-14.webp",
				"systems/cthack/ui/dice/d20/d20-15.webp",
				"systems/cthack/ui/dice/d20/d20-16.webp",
				"systems/cthack/ui/dice/d20/d20-17.webp",
				"systems/cthack/ui/dice/d20/d20-18.webp",
				"systems/cthack/ui/dice/d20/d20-19.webp",
				"systems/cthack/ui/dice/d20/d20-20.webp"
            ],
            system: "cthack"
        });			
		
});
