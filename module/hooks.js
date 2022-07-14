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
            const item = await fromUuid(data.uuid);
            const actor = item.actor;

            let command = null;
            let macroName = null;
    
            // Character's item
            if (item.type === "item") {
                command = `game.cthack.macros.rollItemMacro("${item.id}", "${item.name}");`;
                macroName = item.name + " (" + game.actors.get(actor.id).name + ")";                
            }
    
            // Character's weapon
            else if (item.type === "weapon") {
                command = `if (event?.shiftKey) {\n game.cthack.macros.rollItemMacro("${item.id}", "${item.name}");\n }\n else game.cthack.macros.rollWeaponMacro("${item._id}", "${item.name}");`;
                macroName = item.name + " (" + game.actors.get(actor.id).name + ")";     
            }
    
            // Attack for opponent
            else if (item.type === "attack") {
                command = `game.cthack.macros.rollAttackMacro("${item.id}", "${item.name}");`;
                macroName = item.name + " (" + game.actors.get(actor.id).name + ")";    
            }
    
            // Ability
            else if (item.type === "ability") {
                const maxUses = item.system.uses.max;
                if (maxUses === null) {
                    return ui.notifications.warn(game.i18n.format('MACROS.AbilityWithoutUsage',{itemName: item.name}));
                }
    
                command = `game.cthack.macros.useAbilityMacro("${item.id}", "${item.name}");`;
                macroName = item.name + " (" + game.actors.get(actor.id).name + ")"; 
            }

            if (command !== null) { createMacro(slot, macroName, command, item.img); } 
        }
    
        // Creates a macro to open the actor sheet of the actor dropped on the hotbar
        else if (data.type == "Actor") {
            const actor = await fromUuid(data.uuid);
            const command = `game.actors.get("${actor.id}").sheet.render(true)`
            createMacro(slot, actor.name, command, actor.img);
        }
    
        // Creates a macro to open the journal sheet of the journal dropped on the hotbar
        else if (data.type == "JournalEntry") {
            const journal = await fromUuid(data.uuid);
            const command = `game.journal.get("${journal.id}").sheet.render(true)`
            createMacro(slot, journal.name, command, (journal.img) ? journal.img : "icons/svg/book.svg");
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

/**
 * @description Create a macro
 *  All macros are flaged with a cleenmain.macro flag at true
 * @param {*} slot 
 * @param {*} name 
 * @param {*} command 
 * @param {*} img 
 */
    async function createMacro(slot, name, command, img){
    let macro = game.macros.contents.find(m => (m.name === name) && (m.command === command));
    if (!macro) {
        macro = await Macro.create({
            name: name,
            type: "script",
            img: img,
            command: command,
            flags: {"cthack.macro": true}
        }, {displaySheet: false});
        game.user.assignHotbarMacro(macro, slot);
    } 
}