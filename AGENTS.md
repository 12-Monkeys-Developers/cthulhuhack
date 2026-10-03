# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex) when working with code in this repository.

## Nature du dépôt

Système **Cthulhu Hack** pour Foundry VTT (id `cthack`, V14 uniquement : `minimum`/`maximum` = 14). Le dépôt est installé directement dans `Data/systems/cthack` ; il n'y a ni bundler ni suite de tests. Foundry charge `cthack.mjs` (ES modules natifs) et `css/cthack.css`. Voir `/mnt/c/dataPath/dataPath14/Data/references.md` pour les chemins du cœur Foundry V14 (`/mnt/c/Foundry14`) quand il faut consulter l'API.

`system.json` contient des jetons `#{VERSION}#` et `#{URL}#` remplacés par le workflow GitHub Actions (`.github/workflows/main.yml`) lors de la publication d'une release : ne pas les remplacer à la main. `CHANGELOG.md` (en français, une section par version) est à tenir à jour.

## Commandes

```bash
npm install            # première fois (gulp, gulp-less, @foundryvtt/foundryvtt-cli)
npm run css            # compile styles/cthack.less -> css/cthack.css (une fois)
npm run watch          # recompile le LESS à chaque modification (tâche gulp par défaut)
npm run YMLtoLDB       # src/packs/*.yml  -> packs/ (LevelDB)
npm run LDBtoYAML      # packs/ -> src/packs/*.yml (efface d'abord chaque dossier src/packs/<pack>)
```

- `css/cthack.css` **est versionné** (seuls les `styles/**/*.css` sont ignorés) : le recompiler et le commiter avec les changements LESS.
- `packs/` est ignoré par git ; la source de vérité des compendiums est `src/packs/` en YAML. Après un clone, lancer `npm run YMLtoLDB`. Les commandes de packs doivent être lancées depuis la page d'accueil de Foundry (aucun monde ouvert), sinon LevelDB est verrouillé. Pour modifier un compendium : le modifier dans Foundry, puis `LDBtoYAML`, puis commiter les YAML.
- Les packs existent en paires FR / `-en` (ex. `archetypes` / `archetypes-en`) ; `system.json` (`packFolders`) les range sous « FR » et « EN », et deux réglages masquent l'une ou l'autre langue.
- Pas de linter ni de tests automatisés : la vérification se fait en lançant Foundry. Le code est du Vanilla JS en ES modules, sans jQuery.

## Architecture

Point d'entrée `cthack.mjs` : le hook `init` expose `game.system.api` / `game.cthack`, définit `CONFIG.CTHACK`, branche les classes de documents et les **DataModels** par type (`CONFIG.Actor.dataModels`, `CONFIG.Item.dataModels`), enregistre feuilles, helpers Handlebars, réglages, enrichers de texte et socket `system.cthack`. Les hooks (`setup`, `hotbarDrop`, `diceSoNiceReady`, `renderChatMessageHTML`) sont dans `module/hooks.mjs`.

Découpage de `module/` :
- `data/` — `TypeDataModel` par type (actors : `character`, `opponent` ; items : `ability`, `item`, `weapon`, `magic`, `archetype`, `attack`, `opponentAbility`, `definition`). Les types doivent rester synchronisés avec `documentTypes` de `system.json` (dont `htmlFields`).
- `config/` + `config.mjs` — constantes et listes de choix par type ; `config/system.mjs` agrège tout dans le global `SYSTEM` (aussi `game.system.CONST`), qui contient notamment `ROLL_TYPE` (save, resource, damage, attack, material, weapon, sanity).
- `documents/` — `CtHackActor`/`CtHackItem` (logique métier : jets, ressources, usages), `CtHackRoll` (`roll.mjs`, le gros du système de jets : dialogues d'avantage/désavantage, rendu des cartes), `CtHackChatMessage`.
- `applications/` — feuilles ApplicationV2 (`sheets/`), construites sur `api/document-sheet-mixin.mjs` (classe `cthack`, soumission au changement, mode verrouillé/déverrouillé exposé au gabarit via `locked`/`unlocked`), plus gestionnaire MJ (`manager.mjs`), recherche (`research.mjs`) et menu latéral.
- `macros.mjs` + hook `hotbarDrop` — glisser-déposer vers la barre de macros ; la signature du hook a changé en V14 (régression déjà corrigée en 6.1.0). Une macro agit sur le token sélectionné.
- `enrichers.mjs`, `chat.mjs`, `dice.mjs` (preset Dice So Nice), `elements/` (web components : checkbox, toggle-switch, slide-toggle).

Vues : `templates/` (Handlebars ; `sheets/parts/` pour les fragments, `chat/` pour les messages), `styles/` (LESS : `utils/` variables et mixins, `global/`, `app/`, `components/` limités au scope `.cthack`, tous importés par `styles/cthack.less`), `lang/en.json` + `lang/fr.json` (clés `CTHACK.*`, à tenir synchrones), `ui/` (images, polices, dés).

## Conventions

- Style **mixte** : la majorité des fichiers est sans point-virgule en indentation 2 espaces, mais plusieurs (`config.mjs`, `dice.mjs`, `helpers.mjs`, `hooks.mjs`, `elements/checkbox.mjs`…) ont des points-virgules, voire des tabulations. Suivre le style du fichier édité, ne pas reformater un fichier entier.
- i18n : toute chaîne visible passe par `lang/en.json` **et** `lang/fr.json` (clés `CTHACK.*`), via `game.i18n` dans le JS et `{{localize}}` dans les gabarits. Aucune notification ni texte de gabarit n'est en dur aujourd'hui (seule exception : le titre de marque « Cthulhu Hack » dans `templates/sidebar-menu.hbs`).
- Réutiliser l'existant plutôt que réinventer : nouvelle feuille → partir de `api/document-sheet-mixin.mjs` ; nouveau type de document → DataModel dans `data/`, constantes dans `config/`, entrée dans `system.json` ; nouveau jet → passer par `documents/roll.mjs` et `ROLL_TYPE`.
- JSDoc sur les classes et méthodes publiques.

## Interdits

- Ne pas éditer `css/cthack.css` à la main : il est généré depuis `styles/` (`npm run css`).
- Ne pas toucher à `packs/` (LevelDB, ignoré par git, régénéré) : modifier `src/packs/` ou passer par Foundry puis `LDBtoYAML`.
- Ne pas lancer `LDBtoYAML` sans nécessité : il vide chaque dossier `src/packs/<pack>` avant de réécrire.
- Ne pas modifier `system.json` sans demande explicite (jetons de release, `documentTypes`, `packFolders`).
- Ne pas toucher à `node_modules/`, ni aux images/polices de `ui/` sauf demande.

## Périmètre

Ne modifier que ce que la demande exige : pas de refactoring opportuniste, pas de reformatage, pas de renommage au passage. Signaler les problèmes repérés à côté plutôt que de les corriger.
