import { ROLL_TYPE } from "../config/system.mjs"

export default class CtHackRoll extends Roll {
  /**
   * The HTML template path used to render dice checks of this type
   * @type {string}
   */
  static CHAT_TEMPLATE = "systems/cthack/templates/chat-message.hbs"

  get type() {
    return this.options.type
  }

  get isSave() {
    return this.type === ROLL_TYPE.SAVE
  }

  get isResource() {
    return this.type === ROLL_TYPE.RESOURCE
  }

  get isDamage() {
    return this.type === ROLL_TYPE.DAMAGE
  }

  get isMaterial() {
    return this.type === ROLL_TYPE.MATERIAL
  }

  get target() {
    return this.options.target
  }

  get value() {
    return this.options.value
  }

  get treshold() {
    return this.options.treshold
  }

  get actorId() {
    return this.options.actorId
  }

  get actorName() {
    return this.options.actorName
  }

  get actorImage() {
    return this.options.actorImage
  }

  get introText() {
    return this.options.introText
  }

  get introTextTooltip() {
    return this.options.introTextTooltip
  }

  get modificateur() {
    return this.options.modificateur
  }

  get avantages() {
    return this.options.avantages
  }

  get resultType() {
    return this.options.resultType
  }

  get isFailure() {
    return this.resultType === "failure"
  }

  get hasTarget() {
    return this.options.hasTarget
  }

  get targetName() {
    return this.options.targetName
  }

  get targetArmor() {
    return this.options.targetArmor
  }

  get targetMalus() {
    return this.options.targetMalus
  }

  get realDamage() {
    return this.options.realDamage
  }

  get selectedModifiers() {
    return this.options.selectedModifiers
  }

  /**
   * Generates introductory text based on the roll type.
   *
   * @returns {string} The formatted introductory text for the roll.
   */
  _createIntroText() {
    let text

    switch (this.type) {
      case ROLL_TYPE.SAVE:
        const saveLabel = game.i18n.localize(`CTHACK.Character.saves.${this.target}`)
        text = game.i18n.format("CTHACK.Roll.save", { save: saveLabel })
        text = text.concat("<br>").concat(`Seuil : ${this.treshold}`)
        break
      case ROLL_TYPE.RESOURCE:
        const resourceLabel = game.i18n.localize(`CTHACK.Character.resources.${this.target}`)
        text = game.i18n.format("CTHACK.Roll.resource", { resource: resourceLabel })
        break
      case ROLL_TYPE.DAMAGE:
        const damageLabel = this.target
        text = game.i18n.format("CTHACK.Roll.damage", { item: damageLabel })
        break
      case ROLL_TYPE.ATTACK:
        const attackLabel = this.target
        text = game.i18n.format("CTHACK.Roll.attack", { item: attackLabel })
        break
      case ROLL_TYPE.MATERIAL:
        const materialLabel = this.target
        text = game.i18n.format("CTHACK.Roll.material", { material: materialLabel })
        break
    }
    return text
  }

  /**
   * Generates an introductory text tooltip with characteristics and modifiers.
   *
   * @returns {string} A formatted string containing the value, help, hindrance, and modifier.
   */
  _createIntroTextTooltip() {
    let tooltip = game.i18n.format("TOOLTIPS.saveIntroTextTooltip", { value: this.value, modificateur: this.modificateur })
    tooltip = tooltip.concat(`<br>Avantages : ${this.selectedModifiers}`)
    if (this.hasTarget) {
      tooltip = tooltip.concat(`<br>Cible : ${this.targetName}`)
    }
    return tooltip
  }

  /**
   * Prompt the user with a dialog to configure and execute a roll.
   *
   * @param {Object} options Configuration options for the roll.
   * @param {string} options.rollType The type of roll being performed (e.g., RESOURCE, DAMAGE, ATTACK, SAVE).
   * @param {string} options.rollValue The initial value or formula for the roll.
   * @param {string} options.rollTarget The target of the roll.
   * @param {string} options.actorId The ID of the actor performing the roll.
   * @param {string} options.actorName The name of the actor performing the roll.
   * @param {string} options.actorImage The image of the actor performing the roll.
   * @param {boolean} options.hasTarget Whether the roll has a target.
   * @param {Object} options.target The target of the roll, if any.
   * @param {Object} options.data Additional data for the roll.
   * @param {Object} options.rollAdvantage Default advantage for the roll : =, + , ++, -, --
   *
   * @returns {Promise<Object|null>} The roll result or null if the dialog was cancelled.
   */
  static async prompt(options = {}) {
    let formula = options.rollValue

    // Formula for a resource roll
    if (options.rollType === ROLL_TYPE.RESOURCE) {
      let ressource = game.i18n.localize(`CTHACK.Character.resources.${options.rollTarget}`)
      if (formula === "0" || formula === "") {
        ui.notifications.warn(game.i18n.format("CTHACK.Warning.noResource", { ressource: ressource }))
        return null
      }
    }

    const rollModes = Object.fromEntries(Object.entries(CONFIG.Dice.rollModes).map(([key, value]) => [key, game.i18n.localize(value)]))
    const fieldRollMode = new foundry.data.fields.StringField({
      choices: rollModes,
      blank: false,
      default: "public",
    })

    const choiceAvantage = { normal: "Normal", avantage: "Avantage", desavantage: "Désavantage", doubleAvantage: "Double avantage", doubleDesavantage: "Double désavantage" }
    const choiceModificateur = {
      0: "0",
      "-1": "-1",
      "-2": "-2",
      "-3": "-3",
      "-4": "-4",
      "-5": "-5",
      "-6": "-6",
      "-7": "-7",
      "-8": "-8",
      "-9": "-9",
      "-10": "-10",
    }

    let damageDice

    // Damage roll
    if (options.rollType === ROLL_TYPE.DAMAGE) {
      damageDice = options.rollValue
      // Récupération du nom de l'objet si c'est un jet depuis la fiche de l'acteur
      // Si c'est via une macro le nom est connu
      options.rollTarget = game.actors.get(options.actorId).items.get(options.rollTarget).name
    }

    // Attack roll
    if (options.rollType === ROLL_TYPE.ATTACK) {
      damageDice = options.rollValue
    }

    // Material roll
    if (options.rollType === ROLL_TYPE.MATERIAL) {
      options.rollTarget = game.actors.get(options.actorId).items.get(options.rollTarget).name
    }

    let malus = "0"
    let targetMalus = "0"
    let targetName
    let targetArmor
    let saveModifiers
    const displayOpponentMalus = game.settings.get("cthack", "displayOpponentMalus")

    if (options.rollType === ROLL_TYPE.SAVE && options.hasTarget && options.target.document.actor.type === "opponent") {
      targetName = options.target.document.actor.name
      if (displayOpponentMalus) malus = options.target.document.actor.system.malus.toString()
      else targetMalus = options.target.document.actor.system.malus.toString()
    }

    if (options.rollType === ROLL_TYPE.DAMAGE && options.hasTarget && options.target.document.actor.type === "opponent") {
      targetName = options.target.document.actor.name
      targetArmor = options.target.document.actor.system.armure.toString()
    }

    if (options.rollType === ROLL_TYPE.SAVE) {
      saveModifiers = game.actors.get(options.actorId).system.getSaveModifiers(options.rollTarget)
    }

    let avantages = 3
    if (options.rollAdvantage) {
      switch (options.rollAdvantage) {
        case "+":
          avantages = 4
          break
        case "++":
          avantages = 5
          break
        case "-":
          avantages = 2
          break
        case "--":
          avantages = 1
          break
        case "=":
        default:
          avantages = 3
          break
      }
    }

    let dialogContext = {
      isSave: options.rollType === ROLL_TYPE.SAVE,
      isResource: options.rollType === ROLL_TYPE.RESOURCE,
      isDamage: options.rollType === ROLL_TYPE.DAMAGE,
      isAttack: options.rollType === ROLL_TYPE.ATTACK,
      isMaterial: options.rollType === ROLL_TYPE.MATERIAL,
      rollModes,
      fieldRollMode,
      choiceAvantage,
      choiceModificateur,
      damageDice,
      formula,
      hasTarget: options.hasTarget,
      malus,
      targetName,
      targetArmor,
      saveModifiers,
      avantages,
      selectAvantages: CtHackRoll._convertAvantages(avantages),
      initialAvantages: avantages,
    }
    const content = await renderTemplate("systems/cthack/templates/roll-dialog-v2.hbs", dialogContext)

    const title = CtHackRoll.createTitle(options.rollType, options.rollTarget)
    const label = game.i18n.localize("CTHACK.Roll.roll")
    const rollContext = await foundry.applications.api.DialogV2.wait({
      window: { title: title },
      classes: ["cthack"],
      content,
      buttons: [
        {
          label: label,
          callback: (event, button, dialog) => {
            const output = Array.from(button.form.elements).reduce((obj, input) => {
              if (input.name) obj[input.name] = input.value
              return obj
            }, {})
            // Avantages
            switch (output.avantages) {
              case "1":
                output.avantages = "doubleDesavantage"
                break
              case "2":
                output.avantages = "desavantage"
                break
              case "3":
                output.avantages = "normal"
                break
              case "4":
                output.avantages = "avantage"
                break
              case "5":
                output.avantages = "doubleAvantage"
                break
            }
            return output
          },
        },
      ],
      rejectClose: false, // Click on Close button will not launch an error
      render: (event, dialog) => {
        console.log("dialog"  , dialog)
        // Gestion du sélecteur Avantages et désavantages
        const rangeInput = dialog.querySelector('input[name="avantages"]')
        if (rangeInput) {
          rangeInput.addEventListener("change", (event) => {
            event.preventDefault()
            event.stopPropagation()
            // Reset de tous les choix de Modificateur
            const allModifiers = dialog.querySelectorAll(".bonus")
            allModifiers.forEach((element) => {
              if (element.classList.contains("checked")) element.classList.toggle("checked")
            })
            const readOnly = dialog.querySelector('input[name="selectAvantages"]')
            readOnly.value = this._convertAvantages(parseInt(event.target.value))
          })
        }

        // Gestion des Modificateurs
        const bonusElements = dialog.querySelectorAll(".bonus")
        // Ajoute un event listener à chaque élément
        bonusElements.forEach((element) => {
          element.addEventListener("click", (event) => {
            event.preventDefault()
            event.stopPropagation()
            let bonus = event.currentTarget.closest(".bonus")
            bonus.classList.toggle("checked")

            // Avantage initial
            const initialAdvantage = dialog.querySelector('input[name="initialAvantages"]')
            let avantages = parseInt(initialAdvantage.value)

            let nbChecked = 0
            // Parcours de tous les éléments pour vérifier tous ceux qui sont checked
            let selectedModifiers = []
            const selectedModifiersInput = dialog.querySelector('input[name="selectedModifiers"]')
            const allModifiers = dialog.querySelectorAll(".bonus")
            allModifiers.forEach((element) => {
              if (element.classList.contains("checked")) {
                nbChecked++
                selectedModifiers.push(element.textContent.trim())
              }
            })
            selectedModifiersInput.value = selectedModifiers.join(", ")
            const value = avantages + nbChecked
            if (value <= 0) value = 0
            if (value > 5) value = 5

            rangeInput.value = value
            const readOnly = dialog.querySelector('input[name="selectAvantages"]')
            readOnly.value = this._convertAvantages(value)
          })
        })
      },
    })

    // If the user cancels the dialog, exit
    if (rollContext === null) return

    let treshold

    if (options.rollType === ROLL_TYPE.SAVE) {
      const modificateur = rollContext.modificateur === "" ? 0 : parseInt(rollContext.modificateur, 10)

      if (options.rollType === ROLL_TYPE.SAVE) {
        let dice = "1d20"
        switch (rollContext.avantages) {
          case "avantage":
            dice = "2d20kl"
            break
          case "desavantage":
            dice = "2d20kh"
            break
          case "doubleAvantage":
            dice = "3d20kl"
            break
          case "doubleDesavantage":
            dice = "3d20kh"
            break
        }
        formula = `${dice}`
      }

      treshold = options.rollValue + modificateur
    }

    // Formula for a damage roll
    if (options.rollType === ROLL_TYPE.DAMAGE) {
      formula = damageDice
    }

    // Formula for an attack roll
    if (options.rollType === ROLL_TYPE.ATTACK) {
      formula = damageDice
    }

    const rollData = {
      type: options.rollType,
      target: options.rollTarget,
      value: options.rollValue,
      treshold: treshold,
      actorId: options.actorId,
      actorName: options.actorName,
      actorImage: options.actorImage,
      rollMode: rollContext.visibility,
      hasTarget: options.hasTarget,
      targetName,
      targetArmor,
      targetMalus,
      ...rollContext,
    }

    console.log("rollData", rollData)

    /**
     * A hook event that fires before the roll is made.
     * @function cthack.preRoll
     * @memberof hookEvents
     * @param {Object} options          Options for the roll.
     * @param {Object} rollData         All data related to the roll.
     * @returns {boolean}               Explicitly return `false` to prevent roll to be made.
     */
    if (Hooks.call("cthack.preRoll", options, rollData) === false) return

    const roll = new this(formula, options.data, rollData)

    await roll.evaluate()

    let resultType
    if (options.rollType === ROLL_TYPE.SAVE) {
      resultType = roll.total <= treshold ? "success" : "failure"
    } else if (options.rollType === ROLL_TYPE.RESOURCE) {
      resultType = roll.total === 1 || roll.total === 2 ? "failure" : "success"
    } else if (options.rollType === ROLL_TYPE.MATERIAL) {
      resultType = roll.total === 1 || roll.total === 2 ? "failure" : "success"
    }

    // Armor of the target is taking into account
    let realDamage
    if (options.rollType === ROLL_TYPE.DAMAGE) {
      realDamage = Math.max(0, roll.total - parseInt(targetArmor, 10))
    }

    console.log("roll", roll)
    roll.options.resultType = resultType
    roll.options.treshold = treshold
    roll.options.introText = roll._createIntroText()
    roll.options.introTextTooltip = roll._createIntroTextTooltip()
    roll.options.realDamage = realDamage

    /**
     * A hook event that fires after the roll has been made.
     * @function CTHACK.Roll
     * @memberof hookEvents
     * @param {Object} options          Options for the roll.
     * @param {Object} rollData         All data related to the roll.
      @param {CtHackRoll} roll        The resulting roll.
     * @returns {boolean}               Explicitly return `false` to prevent roll to be made.
     */
    if (Hooks.call("cthack.Roll", options, rollData, roll) === false) return

    return roll
  }

  /**
   * Creates a title based on the given type.
   *
   * @param {string} type The type of the roll.
   * @param {string} target The target of the roll.
   * @returns {string} The generated title.
   */
  static createTitle(type, target) {
    switch (type) {
      case ROLL_TYPE.SAVE:
        return `${game.i18n.localize("CTHACK.Dialog.titleSave")} : ${game.i18n.localize(`CTHACK.Character.saves.${target}`)}`
      case ROLL_TYPE.RESOURCE:
        return `${game.i18n.localize("CTHACK.Dialog.titleResource")} : ${game.i18n.localize(`CTHACK.Character.resources.${target}`)}`
      case ROLL_TYPE.DAMAGE:
        return `${game.i18n.localize("CTHACK.Dialog.titleDamage")} : ${target}`
      case ROLL_TYPE.ATTACK:
        return `${game.i18n.localize("CTHACK.Dialog.titleAttack")} : ${target}`
      case ROLL_TYPE.MATERIAL:
        return `${game.i18n.localize("CTHACK.Dialog.titleMaterial")} : ${target}`
      default:
        return game.i18n.localize("CTHACK.Dialog.titleStandard")
    }
  }

  /** @override */
  async render(chatOptions = {}) {
    let chatData = await this._getChatCardData(chatOptions.isPrivate)
    return await renderTemplate(this.constructor.CHAT_TEMPLATE, chatData)
  }

  /**
   * Generates the data required for rendering a roll chat card.
   *
   * @param {boolean} isPrivate Indicates if the chat card is private.
   * @returns {Promise<Object>} A promise that resolves to an object containing the chat card data.
   * @property {Array<string>} css - CSS classes for the chat card.
   * @property {Object} data - The data associated with the roll.
   * @property {number} diceTotal - The total value of the dice rolled.
   * @property {boolean} isGM - Indicates if the user is a Game Master.
   * @property {string} formula - The formula used for the roll.
   * @property {number} total - The total result of the roll.
   * @property {boolean} isSave - Indicates if the roll is a saving throw.
   * @property {boolean} isResource - Indicates if the roll is related to a resource.
   * @property {boolean} isDamage - Indicates if the roll is for damage.
   * @property {boolean} isMaterial - Indicates if the roll is for material.
   * @property {boolean} isFailure - Indicates if the roll is a failure.
   * @property {Array} avantages - Advantages associated with the roll.
   * @property {string} actorId - The ID of the actor performing the roll.
   * @property {string} actingCharName - The name of the character performing the roll.
   * @property {string} actingCharImg - The image of the character performing the roll.
   * @property {string} introText - Introductory text for the roll.
   * @property {string} introTextTooltip - Tooltip for the introductory text.
   * @property {string} resultType - The type of result (e.g., success, failure).
   * @property {boolean} hasTarget - Indicates if the roll has a target.
   * @property {string} targetName - The name of the target.
   * @property {number} targetArmor - The armor value of the target.
   * @property {number} realDamage - The real damage dealt.
   * @property {boolean} isPrivate - Indicates if the chat card is private.
   * @property {string} cssClass - The combined CSS classes as a single string.
   * @property {string} tooltip - The tooltip text for the chat card.
   */
  async _getChatCardData(isPrivate) {
    const cardData = {
      css: [SYSTEM.id, "dice-roll"],
      data: this.data,
      diceTotal: this.dice.reduce((t, d) => t + d.total, 0),
      isGM: game.user.isGM,
      formula: this.formula,
      total: this.total,
      isSave: this.isSave,
      isResource: this.isResource,
      isMaterial: this.isMaterial,
      isDamage: this.isDamage,
      isFailure: this.isFailure,
      avantages: this.avantages,
      actorId: this.actorId,
      actingCharName: this.actorName,
      actingCharImg: this.actorImage,
      introText: this.introText,
      introTextTooltip: this.introTextTooltip,
      resultType: this.resultType,
      hasTarget: this.hasTarget,
      targetName: this.targetName,
      targetArmor: this.targetArmor,
      realDamage: this.realDamage,
      isPrivate: isPrivate,
    }
    cardData.cssClass = cardData.css.join(" ")
    cardData.tooltip = isPrivate ? "" : await this.getTooltip()
    return cardData
  }

  /**
   * Converts the roll result to a chat message.
   *
   * @param {Object} [messageData={}] Additional data to include in the message.
   * @param {Object} options Options for message creation.
   * @param {string} options.rollMode The mode of the roll (e.g., public, private).
   * @param {boolean} [options.create=true] Whether to create the message.
   * @returns {Promise} - A promise that resolves when the message is created.
   */
  async toMessage(messageData = {}, { rollMode, create = true } = {}) {
    super.toMessage(
      {
        isSave: this.isSave,
        isResource: this.isResource,
        isDamage: this.isDamage,
        isMaterial: this.isMaterial,
        isFailure: this.resultType === "failure",
        avantages: this.avantages,
        introText: this.introText,
        introTextTooltip: this.introTextTooltip,
        actingCharName: this.actorName,
        actingCharImg: this.actorImage,
        hasTarget: this.hasTarget,
        targetName: this.targetName,
        targetArmor: this.targetArmor,
        targetMalus: this.targetMalus,
        realDamage: this.realDamage,
        ...messageData,
      },
      { rollMode: rollMode }
    )
  }

  // Used in the avantages select : convert the selected value to the corresponding string
  static _convertAvantages(value) {
    if (value <= 1) return game.i18n.localize("CTHACK.Roll.doubleDesavantage")
    else if (value >= 5) return game.i18n.localize("CTHACK.Roll.doubleAvantage")
    else if (value === 2) return game.i18n.localize("CTHACK.Roll.desavantage")
    else if (value === 3) return game.i18n.localize("CTHACK.Roll.normal")
    else if (value === 4) return game.i18n.localize("CTHACK.Roll.avantage")
  }
}
