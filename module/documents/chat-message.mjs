import { ROLL_TYPE } from "../config/system.mjs"
import { COMBAT_STATUS } from "../data/card-message.mjs"
import { CombatCard } from "../chat/combat-card.mjs"

/**
 * Title of the card by roll type
 * @type {Record<string, string>}
 */
const CARD_TITLES = {
  [ROLL_TYPE.SAVE]: "CTHACK.Dialog.titleSave",
  [ROLL_TYPE.WEAPON]: "CTHACK.Dialog.titleWeapon",
  [ROLL_TYPE.RESOURCE]: "CTHACK.Dialog.titleResource",
  [ROLL_TYPE.DAMAGE]: "CTHACK.Dialog.titleDamage",
  [ROLL_TYPE.ATTACK]: "CTHACK.Dialog.titleAttack",
  [ROLL_TYPE.MATERIAL]: "CTHACK.Dialog.titleMaterial",
  [ROLL_TYPE.SANITY]: "CTHACK.Dialog.titleSanity",
}

export default class CtHackChatMessage extends ChatMessage {
  static CARD_TEMPLATE = "systems/cthack/templates/chat/roll-card.hbs"

  static CARD_PARTIALS = {
    "cthack.card-dice": "systems/cthack/templates/chat/parts/card-dice.hbs",
    "cthack.card-damage": "systems/cthack/templates/chat/parts/card-damage.hbs",
  }

  /** @type {Promise|undefined} */
  static #partialsLoaded

  async renderHTML({ canDelete, canClose = false, ...rest } = {}) {
    const html = await super.renderHTML({ canDelete, canClose, ...rest })
    this._enrichChatCard(html)
    if (this.type === "card") await this._renderCard(html)
    return html
  }

  /**
   * Render the card from its data and its rolls in place of the message content, and activate its buttons.
   * @param {HTMLElement} html The message element.
   */
  async _renderCard(html) {
    const content = html.querySelector(".message-content")
    if (!content) return
    CtHackChatMessage.#partialsLoaded ??= foundry.applications.handlebars.loadTemplates(CtHackChatMessage.CARD_PARTIALS)
    await CtHackChatMessage.#partialsLoaded
    content.innerHTML = await foundry.applications.handlebars.renderTemplate(CtHackChatMessage.CARD_TEMPLATE, this._prepareCardContext())
    content.addEventListener("click", this._onCardAction.bind(this))
  }

  /**
   * The rendering context of the card.
   * @returns {Object}
   */
  _prepareCardContext() {
    const system = this.system
    const isGM = game.user.isGM
    const isPrivate = !this.isContentVisible
    const mainRoll = this.rolls[0]
    const damageRoll = system.damageRoll
    const status = system.combat
    const isWeaponCard = system.rollType === ROLL_TYPE.WEAPON
    return {
      system,
      isGM,
      isPrivate,
      title: game.i18n.localize(CARD_TITLES[system.rollType]),
      subtitle: isWeaponCard && system.itemName ? `${system.itemName} · ${system.label}` : system.label,
      actor: system.actor,
      target: system.target,
      multipleTargets: system.targetsCount > 1,
      isCheck: system.isCheck,
      isResource: system.isResource,
      isDamage: system.isDamage,
      isCombat: system.isCombat,
      result: system.result,
      isSuccess: system.result === "success",
      mainDice: CtHackChatMessage._getDiceResults(mainRoll),
      mainTotal: mainRoll?.total,
      mainFormula: mainRoll?.formula,
      advantageLabel: system.advantage && system.advantage !== "normal" ? game.i18n.localize(`CTHACK.Roll.${system.advantage}`) : "",
      showHiddenMalus: isGM && system.check.hiddenMalus !== null,
      // Malus caché : le joueur ne voit ni le seuil ni son détail, qui le trahiraient
      hideThreshold: !isGM && system.check.hiddenMalus !== null,
      // Sans adversité ni malus caché, le seuil se résume à la sauvegarde : pas de détail dépliable
      hasThresholdDetail: system.check.adversity !== 0 || (isGM && system.check.hiddenMalus !== null),
      resourceLost: system.isResource && system.result === "failure" && system.resource.from,
      // Combat card : the damage step
      awaitingPlayer: status === COMBAT_STATUS.AWAITING_PLAYER,
      awaitingGm: status === COMBAT_STATUS.AWAITING_GM,
      noDamage: status === COMBAT_STATUS.NO_DAMAGE,
      awaitingHitDice: status === COMBAT_STATUS.AWAITING_HIT_DICE,
      hitDiceDone: system.isCombat && !system.damage && system.hitDiceRolled,
      canRollHitDice: system.canRollHitDice(),
      canRollPlayerDamage: system.canRollPlayerDamage(),
      // Attaque déclarée : pastille de l'en-tête et libellé du bouton des dégâts du personnage
      attackLabel: system.isCombat && system.attackDamage ? game.i18n.localize(system.isUnarmed ? "CTHACK.Card.attackUnarmed" : "CTHACK.Card.attackArmed") : "",
      rollPlayerDamageLabel:
        status === COMBAT_STATUS.AWAITING_PLAYER
          ? game.i18n.format(system.isUnarmed ? "CTHACK.Card.rollUnarmedDamage" : "CTHACK.Card.rollArmedDamage", {
              dice: fromUuidSync(system.actor.uuid)?.system.attributes?.[system.playerDamageId]?.value ?? "",
            })
          : "",
      canRollOpponentDamage: isGM && status === COMBAT_STATUS.AWAITING_GM,
      // The damage block : a damage card, or a resolved combat card
      damage: system.damage && damageRoll ? CtHackChatMessage._getDamageContext(system, damageRoll, isGM) : null,
    }
  }

  /**
   * The rendering context of the damage block.
   * @param {CtHackCardMessage} system The card data.
   * @param {Roll} roll The damage roll.
   * @param {boolean} isGM Is the user a GM.
   * @returns {Object}
   */
  static _getDamageContext(system, roll, isGM) {
    const damage = system.damage
    const fromOpponent = damage.side === "opponent"
    const victim = system.victim
    return {
      ...damage,
      dice: CtHackChatMessage._getDiceResults(roll),
      isFixed: roll.dice.length === 0,
      fromOpponent,
      victim,
      isGM,
      // L'armure de l'Opposant et les dégâts réels ne sont connus que du MJ, comme auparavant
      showArmor: isGM && damage.armor > 0,
      showReal: isGM && damage.side === "character" && system.target?.type === "opponent",
      canApply: isGM && system.canApplyDamage && !damage.applied,
      // Santé en Dés de vie : le joueur du personnage blessé fait un jet de ressource de son Dé de vie
      usesHitDice: system.victimUsesHitDice,
      hitDiceRolled: system.hitDiceRolled,
      canRollHitDice: system.canRollHitDice(),
    }
  }

  /**
   * The results of the dice of a roll : the kept dice and the discarded ones.
   * @param {Roll} [roll]
   * @returns {Array<{value: number, faces: number, discarded: boolean}>}
   */
  static _getDiceResults(roll) {
    if (!roll) return []
    return roll.dice.flatMap((die) =>
      die.results.map((r) => ({
        value: r.result,
        faces: die.faces,
        discarded: r.discarded || r.active === false,
      })),
    )
  }

  /**
   * Handle the click on a button of the card.
   * @param {PointerEvent} event
   */
  async _onCardAction(event) {
    const button = event.target.closest("[data-action]")
    if (!button) return
    event.preventDefault()
    event.stopPropagation()
    const action = button.dataset.action
    if (action === "panToToken") return CombatCard.panToToken(button.dataset.tokenUuid)
    if (button.disabled) return
    button.disabled = true
    try {
      switch (action) {
        case "rollPlayerDamage":
          return await CombatCard.rollPlayerDamage(this)
        case "rollOpponentDamage":
          return await CombatCard.rollOpponentDamage(this)
        case "applyDamage":
          return await CombatCard.applyDamage(this)
        case "rollHitDice":
          return await CombatCard.rollHitDice(this)
      }
    } finally {
      button.disabled = false
    }
  }

  getAssociatedActor() {
    if (this.speaker.scene && this.speaker.token) {
      const scene = game.scenes.get(this.speaker.scene)
      const token = scene?.tokens.get(this.speaker.token)
      if (token) return token.actor
    }
    return game.actors.get(this.speaker.actor)
  }

  _enrichChatCard(html) {
    const actor = this.getAssociatedActor()

    let img
    let nameText
    if (this.isContentVisible) {
      img = actor?.img ?? this.author.avatar
      nameText = this.alias
    } else {
      img = this.author.avatar
      nameText = this.author.name
    }

    const avatar = document.createElement("a")
    avatar.classList.add("avatar")
    if (actor) avatar.dataset.uuid = actor.uuid
    const avatarImg = document.createElement("img")
    Object.assign(avatarImg, { src: img, alt: nameText })
    avatar.append(avatarImg)

    const name = document.createElement("span")
    name.classList.add("name-stacked")
    const title = document.createElement("span")
    title.classList.add("title")
    title.append(nameText)
    name.append(title)

    const sender = html.querySelector(".message-sender")
    sender?.replaceChildren(avatar, name)
  }
}
