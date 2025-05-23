import { SearchDialog } from "./applications/search/research.mjs"
/**
 * Menu spécifique au système
 */
export default function initControlButtons() {
  Hooks.on("getSceneControlButtons", (controls) => {
    controls.cthack = {
      name: "cthack",
      title: "Cthulhu Hack",
      icon: "cthack",
      layer: "cthack",
      tools: {
        "gm-manager": {
          name: "gm-manager",
          title: game.i18n.localize("CTHACK.Manager.Title"),
          icon: "fa-solid fa-users",
          button: true,
          visible: game.user.isGM,
          onChange: (event, active) => {
            if (!foundry.applications.instances.has("cthack-application-manager")) game.system.applicationManager.render(true)
          },
        },
        search: {
          name: "search",
          title: game.i18n.localize("SEARCHTOOL.WindowTitle"),
          icon: "fas fa-magnifying-glass",
          button: true,
          visible: game.user.isGM,
          onChange: async (event, active) => {
            let searchDialog = await new SearchDialog().render(true)
          },
        },
      },
    }
  })
}
