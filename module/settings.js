export const registerSystemSettings = function() {

    /**
     * Fortune option
     */
    game.settings.register("cthack", "FortuneAvailable", {
      name: "Option Fortune",
      hint: "Active ou non la gestion des jetons de Fortune",
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
        name: "Nb jetons Fortune",
        hint: "Nombre de jetons Fortune restant",
        scope: "world",
        config: true,
        default: false,
        type: Number,
        default: 0
      });

};