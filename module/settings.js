export const registerSystemSettings = function() {

    /**
     * Fortune option
     */
    game.settings.register("cthack", "FortuneAvailable", {
      name: "SETTINGS.FortuneAvailableName",
      hint: "SETTINGS.FortuneAvailableHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean,
      default: 0
    });

    /**
     * Track the fortune value
     */
    game.settings.register("cthack", "FortuneValue", {
      name: "SETTINGS.FortuneValueName",
      hint: "SETTINGS.FortuneValueHint",
      scope: "world",
      config: true,
      default: false,
      type: Number,
      default: 0
  });

    /**
     * Adrenaline option
     */
    game.settings.register("cthack", "Adrenaline", {
      name: "SETTINGS.AdrenalineName",
      hint: "SETTINGS.AdrenalineHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean,
      default: 0
    });

};