export function initControlButtons() {

  CONFIG.Canvas.layers.cthack = { layerClass: ControlsLayer, group: "primary" };

  Hooks.on("getSceneControlButtons", (btns) => {
    let menu = [];

    if (game.user.isGM) {
      menu.push({
        name: game.i18n.localize("CTHACK.GMManager.Title"),
        title: game.i18n.localize("CTHACK.GMManager.Title"),
        icon: "fa-solid fa-users",
        button: true,
        onClick: () => { game.cthack.macros.launchGMManager(); }
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
