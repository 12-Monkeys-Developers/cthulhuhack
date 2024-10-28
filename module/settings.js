export const registerSystemSettings = function () {
  /**
   * Revised option
   */
  game.settings.register("cthack", "Revised", {
    name: "SETTINGS.RevisedName",
    hint: "SETTINGS.RevisedHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true,
  })

  /**
   * Adrenaline option
   */
  game.settings.register("cthack", "Adrenaline", {
    name: "SETTINGS.AdrenalineName",
    hint: "SETTINGS.AdrenalineHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true,
  })

  /**
   * Fortune option
   */
  game.settings.register("cthack", "FortuneAvailable", {
    name: "SETTINGS.FortuneAvailableName",
    hint: "SETTINGS.FortuneAvailableHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true,
  })

  /**
   * Track the fortune value
   */
  game.settings.register("cthack", "FortuneValue", {
    name: "SETTINGS.FortuneValueName",
    hint: "SETTINGS.FortuneValueHint",
    scope: "world",
    config: true,
    type: Number,
    default: 0,
    requiresReload: false,
  })

  /**
   * HitDice as resource option
   */
  game.settings.register("cthack", "HitDiceResource", {
    name: "SETTINGS.HitDiceResourceName",
    hint: "SETTINGS.HitDiceResourceHint",
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
    requiresReload: true,
  })

  /**
   * Wealth as resource option
   */
  game.settings.register("cthack", "Wealth", {
    name: "SETTINGS.WealthName",
    hint: "SETTINGS.WealthHint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      none: "SETTINGS.WealthNone",
      fixed: "SETTINGS.WealthFixedValue",
      resource: "SETTINGS.WealthResource",
    },
    default: "fixed",
    requiresReload: true,
  })

  /**
   * Miscellaneous resource option
   */
  game.settings.register("cthack", "MiscellaneousResource", {
    name: "SETTINGS.MiscellaneousResourceName",
    hint: "SETTINGS.MiscellaneousResourceHint",
    scope: "world",
    config: true,
    type: String,
    default: "",
    requiresReload: true,
  })

  /**
   * New HitDice Resource option
   */
  game.settings.register("cthack", "HealthDisplay", {
    name: "SETTINGS.HealthDisplayName",
    hint: "SETTINGS.HealthDisplayHint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      hp: "SETTINGS.HealthDisplayHp",
      hd: "SETTINGS.HealthDisplayHd",
      both: "SETTINGS.HealthDisplayBoth",
    },
    default: "both",
    requiresReload: true,
  })

  game.settings.register("cthack", "worldKey", {
    name: "Unique world key",
    scope: "world",
    config: false,
    type: String,
    default: "",
  })
}
