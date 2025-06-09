import { highlightSuccessFailure } from "./chat.mjs";
import { configureDiceSoNice } from "./dice.mjs";
import { Macros } from "./macros.mjs";
import { SearchChat } from "./applications/research.mjs";

export function registerHooks() {
  Hooks.once("setup", function () {
    // Localize CONFIG objects once up-front
    const toLocalize = ["saves", "attributes"];
    // Exclude some from sorting where the default order matters
    const noSort = ["saves", "attributes"];

    // Localize and sort CONFIG objects
    for (let o of toLocalize) {
      const localized = Object.entries(CONFIG.CTHACK[o]).map((e) => {
        return [e[0], game.i18n.localize(e[1])];
      });
      if (!noSort.includes(o)) localized.sort((a, b) => a[1].localeCompare(b[1]));
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
    if (["Actor", "Item", "JournalEntry", "roll"].includes(data.type)) {
      Macros.createCthackMacro(data, slot);
      return false;
    }
  });

  // Dice-so-nice Ready
  Hooks.once("diceSoNiceReady", (dice3d) => {
    configureDiceSoNice(dice3d);
  });

  Hooks.on("renderChatMessageHTML", (app, html, data) => {
    highlightSuccessFailure(app, html, data);    if (game.user.isGM) {
      html.querySelectorAll(".ask-roll-dice").forEach((btn) => {
        btn.style.display = "none";
      });
    } else {
      html.querySelectorAll(".ask-roll-dice").forEach((btn) => {
        btn.addEventListener("click", (event) => {
          const type = btn.dataset.type;
          const value = btn.dataset.value;
          const avantage = btn.dataset.avantage ?? "=";
          const character = game.user.character;
          if (type === "resource") character.rollResource(value, {rollAdvantage: avantage});
          else if (type === "save") character.rollSave(value, {rollAdvantage: avantage});
        });
      });
    }    // Search feature
    const typeMessage = data.message.flags.world?.type;
    if (typeMessage === "searchPage") {
      //html.find("#ouvrirpage").click(async (event) => await SearchChat.onOpenJournalPage(event, data.message.flags.world?.searchPattern));
      //html.find("#highlight").click(async (event) => await SearchChat.toggleEnricher(event, data.message.flags.world?.searchPattern));
      const messageId = data.message._id;
      const highlightBtn = html.querySelector("#highlight");
      if (highlightBtn) {
        highlightBtn.addEventListener("click", async (event) => {
          await SearchChat.toggleEnricher(event, data.message.flags.world?.searchPattern, messageId);
        });
      }
    }

  });
}
