import { highlightSuccessFailure } from "./chat.js";
import { configureDiceSoNice } from './dice.js';
import { Macros } from './macros.js';

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
    Hooks.on("hotbarDrop", (bar, data, slot) => {
        if (["Actor", "Item", "JournalEntry"].includes(data.type)) {
            Macros.createCthackMacro(data, slot);
            return false;
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
