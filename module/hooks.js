import { highlightSuccessFailure } from "./chat.js";
import { configureDiceSoNice } from './dice.js';

export function registerHooks() {

    Hooks.on('renderChatMessage', async (app, html, data) => {
        highlightSuccessFailure(app, html, data);
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
    
            // Character's item
            if (item.type === "item") {
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
    
            // Character's weapon
            if (item.type === "weapon") {
                command = `if (event?.shiftKey) {\n game.cthack.macros.rollItemMacro("${item._id}", "${item.name}");\n }\n else game.cthack.macros.rollWeaponMacro("${item._id}", "${item.name}");`;
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
    
    // Dice-so-nice Ready
    Hooks.once('diceSoNiceReady', (dice3d) => {
        configureDiceSoNice(dice3d);		
    });

    Hooks.on("renderChatMessage", (message, html, data) => {
        if (game.user.isGM) {
            html.find(".ask-roll-dice").each((i, btn) => {
                btn.style.display = "none"
              });
        }
        else {
            html.find(".ask-roll-dice").click(event => {
                const btn = $(event.currentTarget); 
                const type = btn.data("type");
                const resource = btn.data("resource"); 
                const character = game.user.character;
                if (type === "resource")
                    character.rollResource(resource.toLowerCase());
                else if (type === 'save')
                    character.rollSave(resource.toLowerCase());
            });
        }
		 
    });

}