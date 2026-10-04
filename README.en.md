# Cthulhu Hack System for Foundry VTT

🇫🇷 [Version française](README.md)

<div align="center">

![Supported Foundry VTT versions](https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fversion%3Fstyle%3Dflat%26url%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2F12-Monkeys-Developers%2Fcthulhuhack%2Fmain%2Fsystem.json)
![Latest Release](https://img.shields.io/github/v/release/12-Monkeys-Developers/cthulhuhack?label=Latest%20release)

</div>

The Cthulhu Hack is a role playing game created by Paul Baldowski published by <a href="http://www.justcrunch.com">Just Crunch Games</a>. The Cthulhu Hack trademark, the Cthulhu Hack logo, the Just Crunch Games trademark and the Just Crunch Games logo are the property of Just Crunch Games.

The Cthulhu Hack is published in French by <a href="https://www.les12singes.com">Les XII Singes</a> under the name Cthulhu Hack VF. Cthulhu Hack VF is part of the Dark Monkeys collection. The Cthulhu Hack VF trademark, the Cthulhu Hack VF logo, the Dark Monkeys trademark, the Dark Monkeys logo, the XII Monkeys trademark and the XII Monkeys logo are the property of ReSpell.

The graphics used for Foundry VTT are produced by Maxime Plasse (https://www.maxsmaps.com/). They are provided for Foundry VTT use. Any other use or reproduction of images must obtain the agreement of ReSpell / Les XII Singes.

Join the Discord FR community: <a href='https://discord.gg/pPSDNJk'>Foundry VTT Discord FR</a>

This system is developed by Kristov, with the contribution of Lightbringer for the compendiums and tests.
Thanks to Limpar for the English translation of the compendiums.

## Features

Version 6.2.0 — compatible with Foundry VTT V14. See the [CHANGELOG](CHANGELOG.md) for the detailed history.

A **user guide** for the GM, in French and English, is provided in the "FR - Guide du système" and "EN - System guide" compendiums.

### Supported modules with specific adaptation
- Token Action HUD Cthulhu Hack (with Token Action HUD Core)
- Dice So Nice (custom dice)

### Character
- Sheet locked by default, unlocked with a switch in the title bar; drops are only accepted on an unlocked sheet
- Description, Equipment, Abilities & Magic and Notes tabs
- Items, weapons, abilities and spells added by drag and drop or with the + buttons (click: weapon, Shift + click: item); click a line to expand its description
- Right-click an element: send its description to the chat, edit, delete
- Abilities with limited uses (per day, scene, scenario…) with last-use date; right-click to Use, Increase or Reset
- Spells and rituals with a sanity roll
- Material die, resources (Flashlights, Smokes, Sanity, wealth, miscellaneous resource) with automatic reduction on failure
- Weapon and item encumbrance (option)
- Archetype dropped on the sheet: fills in the resources, hit dice, wealth and damage

### Opponent
- Two-tab sheet: description, then attacks / abilities / spells
- Changing the hit dice recomputes the maximum HP and the penalty
- Attacks with a damage die and fixed damage

### Dice rolls
- Saves, resources, material, sanity, damage and attacks
- Single roll dialog: target, Armed / Unarmed attack, malus from 0 to −10, final threshold, clickable modifiers (occupation, skills with the reissue, abilities), single or double advantage and disadvantage, roll visibility
- Targeted Opponent's malus filled in automatically (option)
- Roll cards: actor and target tokens, discarded dice greyed out, threshold breakdown, Success / Failure banner, lost resource
- Combat on a single card against a targeted Opponent: the character's damage on a success (automatic with the Simultaneous damage option), counter-attack chosen by the GM on a failure, GM "Apply" button that removes the damage from HP (armour deducted) or Hit Dice roll
- `@jet` / `@roll` enrichers to ask everyone for a roll from a journal, an actor or an item

### Conditions
- "Definition" items for Out of Action, Temporary Insanity and Shock, added by drag and drop
- Token icon; automatic disadvantage (Mild Concussion, Staggered, Winded) and −4 to physical saves (Cracked Bones)

### GM tools
- Cthulhu Hack sidebar tab: version, help links, players manager and search
- Players manager: resources and saves of connected players, ask one or all players for a roll
- Fortune: right-click the Fortune on a sheet to use it (announced in chat) or increase it
- Search in the world's journals, actors and items, with highlighting

### Macro bar
- Drag an actor, a journal, a save, a resource, damage, a weapon (click: attack, Shift + click: material), an item, an ability, a spell or an Opponent attack to create the matching macro
- Item, weapon, ability, spell and attack macros act on the selected token

### Options
- Reissue, Fortune and Adrenaline
- Hit points, hit dice or both; wealth and miscellaneous resource
- Encumbrance, opponent malus, simultaneous damage
- CSS style customizable by a module

### Compendiums
- Grouped in a Cthulhu Hack folder, with FR and EN subfolders
- System guide (GM)
- Archetypes (revised, with the Scholar's variations): drag onto the sheet to fill it in
- Special weapons and standard special abilities
- Out of Action, Temporary Insanity and Shock tables, with their RollTables
- Pregenerated characters: one per archetype
- Creatures from the core book
- Macros: table rolls
