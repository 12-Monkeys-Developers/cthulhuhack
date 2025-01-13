/**
 * Enricher qui permet de transformer un texte en un lien de lancer de dés
 * Pour une syntaxe de type @jet[x]{y}(z) avec x la caractéristique, y le titre et z l'avantage
 * x de type for, dex, con, sag, int, char, str, wis pour les caractéristiques
 * et de type torche, bagou, san, flashlights, smokes, wealthDice, hitDice, miscellaneous pour les ressources
 * y est le titre du jet et permet de décrire l'action
 * z est l'avantage du jet, avec pour valeurs possibles : --, -, +, ++
 */
export function setupTextEnrichers() {
  CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat([
    {
      // eslint-disable-next-line no-useless-escape
      pattern: /\@jet\[(.+?)\]{(.*?)}\((.*?)\)/gm,
      enricher: async (match, options) => {
        const a = document.createElement("a")
        a.classList.add("ask-roll-journal")
        let target = match[1]
        const title = match[2]
        const avantage = match[3]

        if (
          !["for", "dex", "con", "sag", "int", "char", "str", "wis", "torche", "bagou", "san", "flashlights", "smokes", "wealthDice", "hitDice", "miscellaneous"].includes(target)
        )
          return

        let type = "resource"
        if (["for", "dex", "con", "sag", "int", "char", "str", "wis"].includes(target)) {
          type = "save"
          if (target === "for") {
            target = "str"
          }
          if (target === "sag") {
            target = "wis"
          }
        }

        if (type === "resource") {
          if (target === "torche") {
            target = "flashlights"
          }
          if (target === "bagou") {
            target = "smokes"
          }
        }

        let rollAvantage = "normal"
        if (avantage) {
          switch (avantage) {
            case "++":
              rollAvantage = "++"
              break
            case "+":
              rollAvantage = "+"
              break
            case "-":
              rollAvantage = "-"
              break
            case "--":
              rollAvantage = "--"
              break
            default:
              break
          }
        }

        a.dataset.rollType = type
        a.dataset.rollTarget = target
        a.dataset.rollTitle = title
        a.dataset.rollAvantage = rollAvantage
        a.innerHTML = `
            <i class="fas fa-dice-d20"></i> ${getLibelle(type, target)}${rollAvantage !== "normal" ? rollAvantage : ""}
          `
        return a
      },
    },
  ])
}

/**
 * Retrieves the localized label for a given type and target.
 *
 * @param {string} type - The type of label to retrieve. Can be either "save" or another type.
 * @param {string} target - The specific target for which the label is being retrieved.
 * @returns {string} The localized label corresponding to the type and target.
 */
function getLibelle(type, target) {
  if (type === "save") {
    return game.i18n.localize(`CTHACK.Character.saves.${target}`)
  } else {
    return game.i18n.localize(`CTHACK.Character.resources.${target}`)
  }
}
