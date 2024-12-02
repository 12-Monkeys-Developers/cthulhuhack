export class Macros {
  static createCthackMacro = async function (dropData, slot) {
    // Create macro depending of the item dropped on the hotbar
    if (dropData.type == "Item") {
      const item = await fromUuid(dropData.uuid)
      const actor = item.actor

      let command = null
      let macroName = null

      // Character's item
      if (item.type === "item") {
        command = `game.cthack.macros.rollItemMacro("${item.id}", "${item.name}");`
        macroName = item.name + " (" + game.actors.get(actor.id).name + ")"
      }

      // Character's weapon
      else if (item.type === "weapon") {
        command = `if (event?.shiftKey) {\n game.cthack.macros.rollItemMacro("${item.id}", "${item.name}");\n }\n else game.cthack.macros.rollWeaponMacro("${item._id}", "${item.name}");`
        macroName = item.name + " (" + game.actors.get(actor.id).name + ")"
      }

      // Attack for opponent
      else if (item.type === "attack") {
        command = `game.cthack.macros.rollAttackMacro("${item.id}", "${item.name}");`
        macroName = item.name + " (" + game.actors.get(actor.id).name + ")"
      }

      // Ability
      else if (item.type === "ability") {
        const maxUses = item.system.uses.max
        if (maxUses === null) {
          return ui.notifications.warn(game.i18n.format("MACROS.AbilityWithoutUsage", { itemName: item.name }))
        }

        command = `game.cthack.macros.useAbilityMacro("${item.id}", "${item.name}");`
        macroName = item.name + " (" + game.actors.get(actor.id).name + ")"
      }

      if (command !== null) {
        this.createMacro(slot, macroName, command, item.img)
      }
    }

    // Creates a macro to open the actor sheet of the actor dropped on the hotbar
    else if (dropData.type == "Actor") {
      const actor = await fromUuid(dropData.uuid)
      const command = `game.actors.get("${actor.id}").sheet.render(true)`
      this.createMacro(slot, actor.name, command, actor.img)
    }

    // Creates a macro to open the journal sheet of the journal dropped on the hotbar
    else if (dropData.type == "JournalEntry") {
      const journal = await fromUuid(dropData.uuid)
      const command = `game.journal.get("${journal.id}").sheet.render(true)`
      this.createMacro(slot, journal.name, command, journal.img ? journal.img : "icons/svg/book.svg")
    }
  }

  /**
   * @description Create a macro
   *  All macros are flaged with a cthack.macro flag at true
   * @param {*} slot
   * @param {*} name
   * @param {*} command
   * @param {*} img
   */
  static createMacro = async function (slot, name, command, img) {
    let macro = game.macros.contents.find((m) => m.name === name && m.command === command)
    if (!macro) {
      macro = await Macro.create(
        {
          name: name,
          type: "script",
          img: img,
          command: command,
          flags: { "cthack.macro": true },
        },
        { displaySheet: false }
      )
      game.user.assignHotbarMacro(macro, slot)
    }
  }

  /**
   * @name rollItemMacro
   * @description Roll the item
   *              Check that only one token is selected and he has the item
   * @public
   *
   * @param {*} itemId
   * @param {*} itemName
   *
   * @returns     Launch the item roll window
   */
  static rollItemMacro = async function (itemId, itemName) {
    // Check only one token is selected
    const tokens = canvas.tokens.controlled
    if (tokens.length > 1) return ui.notifications.warn(game.i18n.localize("MACROS.MultipleTokensSelected"))
    const token = canvas.tokens.controlled[0]

    const actor = token ? token.actor : null
    if (!actor) return ui.notifications.warn(game.i18n.localize("MACROS.NoTokenSelected"))

    // Check the actor has the item
    let item = actor.items.get(itemId)
    if (!item) return ui.notifications.warn(game.i18n.format("MACROS.ObjectNotInInventory", { itemName: itemName, actorName: actor.name }))

    // Open the roll window if the item uses resource and is not at 0
    if (item.system.dice === "") {
      return ui.notifications.warn(game.i18n.format("MACROS.ObjectWithoutResource", { itemName: itemName }))
    }
    if (item.system.dice === "0") {
      return ui.notifications.warn(game.i18n.format("MACROS.ObjectEmptyResource", { itemName: itemName }))
    }
    actor.rollMaterial(item)
  }

  /**
   * @name rollWeaponMacro
   * @description Roll the weapon attack : Strength save if Range is empty, Dexterity save if Range is not empty
   *              Check that only one token is selected and he has the item
   * @public
   *
   * @param {*} itemId
   * @param {*} itemName
   *
   * @returns     Launch the save roll window
   */
  static rollWeaponMacro = async function (itemId, itemName, rollAdvantage = '=') {
    // Check only one token is selected
    const tokens = canvas.tokens.controlled
    if (tokens.length > 1) return ui.notifications.warn(game.i18n.localize("MACROS.MultipleTokensSelected"))
    const token = canvas.tokens.controlled[0]

    const actor = token ? token.actor : game.user.character
    if (!actor) return ui.notifications.warn(game.i18n.localize("MACROS.NoTokenSelected"))

    // Check the actor has the item
    let item = actor.items.get(itemId)
    if (!item) return ui.notifications.warn(game.i18n.format("MACROS.ObjectNotInInventory", { itemName: itemName, actorName: actor.name }))

    // Open the save window if the item uses resource and is not at 0, or if the item uses no resource
    if (item.system.dice === "0") {
      return ui.notifications.warn(game.i18n.format("MACROS.ObjectEmptyResource", { itemName: itemName }))
    }

    let mod = 0
    if (game.user.targets.size > 0) {
      const target = [...game.user.targets][0]
      if (target.actor.type == "opponent") {
        mod = target.actor.system.malus
      }
    }
    if (mod < 0) {
      item.system.range === "" ? actor.rollSave("str", { modifier: mod, rollAdvantage }) : actor.rollSave("dex", { modifier: mod, rollAdvantage })
    } else {
      item.system.range === "" ? actor.rollSave("str", {rollAdvantage}) : actor.rollSave("dex", {rollAdvantage})
    }
  }

  /**
   * @name rollAttackMacro
   * @description Roll the item of type Attack for Opponent
   *              Check that only one token is selected and he has the attack item
   * @public
   *
   * @param {*} itemId
   * @param {*} itemName
   *
   * @returns     Launch the item roll window
   */
  static rollAttackMacro = async function (itemId, itemName) {
    // Check only one token is selected
    const tokens = canvas.tokens.controlled
    if (tokens.length > 1) return ui.notifications.warn(game.i18n.localize("MACROS.MultipleTokensSelected"))
    const token = canvas.tokens.controlled[0]

    const actor = token ? token.actor : null
    if (!actor) return ui.notifications.warn(game.i18n.localize("MACROS.NoTokenSelected"))

    // Check the actor has the item
    let item = actor.items.get(itemId)
    if (!item) return ui.notifications.warn(game.i18n.format("MACROS.AttackNotFound", { opponentName: actor.name, itemName: itemName }))

    // Open the roll window
    actor.rollAttackDamageRoll(item)
  }

  /**
   * @name useAbilityMacro
   * @description Use the ability is there is still uses left
   *              Check that only one token is selected and he has the ability item
   * @public
   *
   * @param {*} itemId
   * @param {*} itemName
   *
   * @returns     Launch the item roll window
   */
  static useAbilityMacro = async function (itemId, itemName) {
    // Check only one token is selected
    const tokens = canvas.tokens.controlled
    if (tokens.length > 1) return ui.notifications.warn(game.i18n.localize("MACROS.MultipleTokensSelected"))
    const token = canvas.tokens.controlled[0]

    const actor = token ? token.actor : null
    if (!actor) return ui.notifications.warn(game.i18n.localize("MACROS.NoTokenSelected"))

    // Check the actor has the item
    let item = actor.items.get(itemId)
    if (!item) return ui.notifications.warn(game.i18n.format("MACROS.AbilityNotFound", { characterName: actor.name, itemName: itemName }))

    // Use the ability
    if (item.system.uses.value === 0) {
      ui.notifications.warn(game.i18n.format("MACROS.AbilityUsesAtZero", { itemName: itemName }))
    }
    actor.useAbility(item)
  }

  static launchGMManager = function () {
    game.cthack.gmManager.render(true)
  }
}
