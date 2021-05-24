// Import Modules
import { CTHACK } from './config.js';
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

Hooks.once('init', async function() {
	console.log(`CTHACK | Initializing the Cthulhu Hack Game System\n`);
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
	Actors.registerSheet('cthack', CtHackActorSheet, { types: [ 'character' ], makeDefault: true, label: 'CTHACK.SheetClassCharacter' });
	Actors.registerSheet('cthack', CtHackOpponentSheet, { types: [ 'opponent' ], makeDefault: true, label: 'CTHACK.SheetClassOpponent' });
	Items.unregisterSheet('core', ItemSheet);
	Items.registerSheet('cthack', CtHackItemSheet, { types: [ 'item', 'weapon', 'attack', 'ability', 'definition' ], makeDefault: true, label: 'CTHACK.SheetClassItem' });
	Items.registerSheet('cthack', CtHackArchetypeSheet, { types: [ 'archetype' ], makeDefault: true, label: 'CTHACK.SheetClassItem' });

	// Preload Handlebars Templates
	preloadHandlebarsTemplates();

	// Register Handlebars Helpers
	registerHandlebarsHelpers();

	// Register System Settings
	registerSystemSettings();
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
				macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
				if (!macro) {
					macro = await Macro.create({
						name: item.name,
						type : "script",
						img: item.img,
						command : command
					}, {displaySheet: false})
				}

			}

			// Attack for opponent
			if (item.type === "attack") {
				command = `game.cthack.macros.rollAttackMacro("${item._id}", "${item.name}");`;
				macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
				if (!macro) {
					macro = await Macro.create({
						name: item.name,
						type : "script",
						img: item.img,
						command : command
					}, {displaySheet: false})
				}
			}

			// Ability
			if (item.type === "ability") {
				const maxUses = item.data.uses.max;
				if (maxUses === null) {
					return ui.notifications.warn(game.i18n.format('MACROS.AbilityWithoutUsage',{itemName: item.name}));
				}

				command = `game.cthack.macros.useAbilityMacro("${item._id}", "${item.name}");`;
				macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
				if (!macro) {
					macro = await Macro.create({
						name: item.name,
						type : "script",
						img: item.img,
						command : command
					}, {displaySheet: false})
				}
			}

           game.user.assignHotbarMacro(macro, slot);
        }
        // Creates a macro to open the actor sheet of the actor dropped on the hotbar
        else if (data.type == "Actor") {
            let actor = game.actors.get(data.id);
            let command = `game.actors.get("${data.id}").sheet.render(true)`
            let macro = game.macros.entities.find(m => (m.name === actor.name) && (m.command === command));
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
            let macro = game.macros.entities.find(m => (m.name === journal.name) && (m.command === command));
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
        //return false;
    });
