import { SearchDialog } from "./applications/search/research.mjs";

export function initControlButtons() {

  CONFIG.Canvas.layers.cthack = { layerClass: ControlsLayer, group: "primary" };

  Hooks.on("getSceneControlButtons", (btns) => {
    let menu = [];

    if (game.user.isGM) {
      menu.push({
        name: "gm-manager",
        title: game.i18n.localize("CTHACK.GMManager.Title"),
        icon: "fa-solid fa-users",
        button: true,
        onClick: () => { 
          if (Object.values(ui.windows).some(item => item.options?.id === "gm-manager")) game.cthack.gmManager.close(); 
          else game.cthack.macros.launchGMManager()
        }
      });

      menu.push({
        name: "search",
        title: game.i18n.localize("SEARCHTOOL.WindowTitle"),
        icon: "fas fa-magnifying-glass",
        button: true,
        onClick: async () => {
          let searchDialog = await new SearchDialog().render(true);
        },
      });

      btns.push({
        name: "cthack",
        title: "Cthulhu Hack",
        icon: "cthack",
        layer: "cthack",
        tools: menu
      });
    }
  });
}
