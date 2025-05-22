const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api
import { SYSTEM } from "../config/system.mjs"

/**
 * An application for managing the players of the game.
 * @extends ApplicationV2
 * @mixes HandlebarsApplication
 * @alias PermissionConfig
 */
export default class CtHackManager extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(options = {}) {
    super()
    Hooks.on("updateSetting", () => game.system.applicationManager.render(false))
    Hooks.on("updateActor", () => game.system.applicationManager.render(false))
    Hooks.on("renderPlayerList", () => game.system.applicationManager.render(false))
  }

  static DEFAULT_OPTIONS = {
    id: "cthack-application-manager",
    tag: "form",
    window: {
      contentClasses: ["cthack", "gm-manager"],
      title: "CTHACK.Manager.Title",
      resizable: true,
    },
    position: {
      top: 100,
      left: 120,
      width: 1300,
      height: "auto",
    },
    form: {
      closeOnSubmit: true,
    },
    actions: {
      resourceAll: CtHackManager.#onResourceAll,
      resourceOne: CtHackManager.#onResourceOne,
      saveAll: CtHackManager.#onSaveAll,
      saveOne: CtHackManager.#onSaveOne,
      openSheet: CtHackManager.#onOpenSheet,
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/cthack/templates/manager.hbs",
    },
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(_options = {}) {
    const misc = game.settings.get("cthack", "MiscellaneousResource")
    const healthDisplay = game.settings.get("cthack", "HealthDisplay")
    const wealth = game.settings.get("cthack", "Wealth")
    const v2 = game.settings.get("cthack", "Revised")
    return {
      players: game.users.filter((u) => u.hasPlayerOwner && u.active),
      misc,
      healthDisplay,
      wealth,
      hasMisc: misc !== "",
      hasHP: healthDisplay === "hp" || healthDisplay === "both",
      hasHD: healthDisplay === "hd" || healthDisplay === "both",
      hasWealthResource: wealth === "resource",
      hasWealthFixed: wealth === "fixed",
      isV2: v2,
    }
  }

  static async #onResourceAll(event, target) {
    const value = event.target.dataset.resource
    if (value === "Adrenaline") return
    CtHackManager.askRollForAll("resource", value)
  }

  static async #onSaveAll(event, target) {
    const value = event.target.dataset.save
    CtHackManager.askRollForAll("save", value)
  }

  static #onResourceOne(event, target) {
    const value = event.target.dataset.resource
    const recipient = event.target.parentElement.dataset.userId
    const name = event.target.parentElement.dataset.characterName
    CtHackManager.askRollForOne("resource", value, recipient, name)
  }

  static async #onSaveOne(event, target) {
    const value = event.target.dataset.save
    const recipient = event.target.parentElement.dataset.userId
    const name = event.target.parentElement.dataset.characterName
    CtHackManager.askRollForOne("save", value, recipient, name)
  }

  static #onOpenSheet(event, target) {
    const characterId = event.target.dataset.characterId
    game.actors.get(characterId).sheet.render(true)
  }

  static async askRollForAll(type, value, title = null, avantage = null) {
    let text

    if (type === "save") text = game.i18n.format("CHAT.AskRollForAll", { resource: game.i18n.localize(SYSTEM.SAVES[value].label) })
    else {
      let label
      if (value === "miscellaneous") {
        label = game.settings.get("cthack", "MiscellaneousResource")
      } else {
        label = game.i18n.localize(SYSTEM.RESOURCES[value].label)
      }
      text = game.i18n.format("CHAT.AskRollForAll", { resource: label })
    }

    if (avantage) {
      switch (avantage) {
        case "++":
          text += ` ${game.i18n.localize("CTHACK.DoubleAdvantage")}`
          break
        case "+":
          text += ` ${game.i18n.localize("CTHACK.Advantage")}`
          break
        case "-":
          text += ` ${game.i18n.localize("CTHACK.Disadvantage")}`
          break
        case "--":
          text += ` ${game.i18n.localize("CTHACK.DoubleDisadvantage")}`
          break
        default:
          break
      }
    }
    ChatMessage.create({
      user: game.user.id,
      content: await foundry.applications.handlebars.renderTemplate(`systems/cthack/templates/chat/ask-roll.hbs`, {
        title: title !== null ? title : "",
        text: text,
        rollType: type,
        value: value,
        avantage: avantage,
      }),
      flags: { cthack: { typeMessage: "askRoll" } },
    })
  }

  static async askRollForOne(type, value, recipient, name) {
    let label
    if (type === "resource" && value === "miscellaneous") {
      label = game.settings.get("cthack", "MiscellaneousResource")
    } else label = game.i18n.localize(`CTHACK.Manager.${value}`)
    const text = game.i18n.format("CHAT.AskRollIndividual", { resource: label, name: name })

    game.socket.emit(`system.${SYSTEM.id}`, {
      action: "askRoll",
      data: {
        userId: recipient,
      },
    })

    ChatMessage.create({
      user: game.user.id,
      content: await foundry.applications.handlebars.renderTemplate(`systems/cthack/templates/chat/ask-roll.hbs`, {
        text: text,
        rollType: type,
        value: value,
      }),
      whisper: [recipient],
      flags: { cthack: { typeMessage: "askRoll" } },
    })
  }
}
