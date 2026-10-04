/**
 * Génère les sources YAML des compendiums du guide (src/packs/guide et src/packs/guide-en) à partir des pages HTML de guide/html/<langue>/.
 * Dans les pages, `@@page:<fichier>@@` devient un lien vers la page du guide de la même langue, et `@@img:<nom>@@` le chemin de la capture ui/guide/<langue>/<nom>.webp.
 * Les identifiants sont fixes pour que les liens et les mises à jour restent stables : `npm run guide`, puis `npm run YMLtoLDB` (Foundry fermé).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "fs"
import yaml from "js-yaml"

const SYSTEM_ID = "cthack"

/** Pages dans l'ordre du guide : fichier HTML → identifiant de page */
const PAGES = [
  { file: "introduction", ids: { fr: "6rz53Y4KlOMRvkw3", en: "ThKLWsHL8wFLbX3q" } },
  { file: "options", ids: { fr: "FOaRYBbzkJhYejtu", en: "KsksA2v9ze5O80AW" } },
  { file: "personnage", ids: { fr: "RU9sFGH6pljeJQi6", en: "jUW07znuDRrGJ0cm" } },
  { file: "adversaire", ids: { fr: "8y6qQY3vl7DLJMWY", en: "FjUQK4jDVqbQww0H" } },
  { file: "jets", ids: { fr: "myQHUZRgImQ9cmj5", en: "MkpSqd2pzzBsYpRB" } },
  { file: "outils", ids: { fr: "7BUnactZ8KvPfGhB", en: "Syeh6uaZWPJzq16a" } },
]

const LANGS = {
  fr: {
    pack: "guide",
    journalId: "LCgvsWO3juonkohy",
    journalName: "Guide du système",
    titles: {
      introduction: "Introduction",
      options: "Options du système",
      personnage: "Le Personnage",
      adversaire: "L'Adversaire",
      jets: "Jets et messages",
      outils: "Outils du MJ",
    },
  },
  en: {
    pack: "guide-en",
    journalId: "VxBiKbxjMlK7dyK7",
    journalName: "System guide",
    titles: {
      introduction: "Introduction",
      options: "System settings",
      personnage: "The Character",
      adversaire: "The Opponent",
      jets: "Rolls and messages",
      outils: "GM tools",
    },
  },
}

let missing = 0

for (const [lang, L] of Object.entries(LANGS)) {
  const pageLink = (file) => {
    const page = PAGES.find((p) => p.file === file)
    if (!page) throw new Error(`Page inconnue : ${file}`)
    return `@UUID[Compendium.${SYSTEM_ID}.${L.pack}.JournalEntry.${L.journalId}.JournalEntryPage.${page.ids[lang]}]{${L.titles[file]}}`
  }
  const imagePath = (name) => {
    const path = `ui/guide/${lang}/${name}.webp`
    if (!existsSync(path)) {
      console.warn(`Image absente : ${path}`)
      missing++
    }
    return `systems/${SYSTEM_ID}/${path}`
  }

  const pages = PAGES.map((page, index) => {
    const content = readFileSync(`guide/html/${lang}/${page.file}.html`, "utf-8")
      .replace(/@@page:([a-z]+)@@/g, (_, file) => pageLink(file))
      .replace(/@@img:([a-z0-9-]+)@@/g, (_, name) => imagePath(name))
      .trimEnd()
    return {
      _id: page.ids[lang],
      name: L.titles[page.file],
      type: "text",
      title: { show: false, level: 1 },
      image: {},
      text: { format: 1, content },
      video: { controls: true, volume: 0.5 },
      src: null,
      system: {},
      sort: (index + 1) * 100000,
      ownership: { default: -1 },
      flags: {},
      _key: `!journal.pages!${L.journalId}.${page.ids[lang]}`,
    }
  })

  const journal = {
    _id: L.journalId,
    name: L.journalName,
    pages,
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {},
    _key: `!journal!${L.journalId}`,
  }

  const dir = `src/packs/${L.pack}`
  if (existsSync(dir)) for (const f of readdirSync(dir)) rmSync(`${dir}/${f}`)
  mkdirSync(dir, { recursive: true })
  const fileName = `${dir}/journal_${L.journalName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w]+/g, "_")}_${L.journalId}.yml`
  writeFileSync(fileName, yaml.dump(journal, { lineWidth: -1, noRefs: true }))
  console.log(`${fileName} : ${pages.length} pages`)
}

if (missing) console.warn(`${missing} image(s) absente(s)`)
