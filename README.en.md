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

Version 6.1.2 — compatible with Foundry VTT V14. See the [CHANGELOG](CHANGELOG.md) for the detailed history.

### Supported modules with specific adaptation
- Token Action HUD Classic
- Dice So Nice (custom dice)

### Character
- Lockable / unlockable sheet with a notes tab
- Items, weapons and special abilities can be added, edited and sorted by drag and drop; click a name to expand its description
- Abilities with limited uses (per day, scene, scenario…), with last-use date and a reset button
- Magic items (spells and rituals)
- Supplies die, resources (hit dice or hit points, wealth, miscellaneous resource) with automatic reduction on failure
- Item size / encumbrance (option)
- Quick creation: click for an item, Shift + click for a weapon

### Opponent
- Two-tab sheet: description, then attacks / abilities / spells
- Attacks are items with an integrated damage roll

### Dice rolls
- Saves, resources, supplies and weapons with advantage, disadvantage, double advantage / disadvantage, bonus and penalty
- Single roll dialog taking abilities, occupation and skills into account (revised edition: success if result ≤ target)
- Targeted adversary's penalty (option)
- Simultaneous damage (option): a weapon roll against a targeted opponent chains the damage roll
- Character icon and name shown in chat messages
- `@jet` enrichers to create roll links in journals, actors and items

### Conditions
- "Definition" items for the Out of Action, Temporary Insanity and Shock tables, added by drag and drop
- Token icon and automatic handling of disadvantages

### GM tools
- GM Manager: resources and abilities of connected players, ask one or all players for a roll, Fortune management
- System menu in the scene controls
- Search in journals and items
- Send an item's description to the chat

### Macro bar
- Drag an actor, an article, an item, an ability, a save, a resource, a damage roll or an opponent attack / spell to create the matching macro
- The relevant token must be selected to use a macro

### Options
- Show / hide the French or English compendiums
- Fortune (tokens spent by the GM, announced in chat) and Adrenaline
- Hit dice, hit points or both; wealth or miscellaneous resource
- Size (encumbrance), revised edition, adversary penalty, simultaneous damage
- CSS style customizable by a module

### Compendiums
- Archetypes (revised, with the Scholar's variations): drag onto the sheet to fill it in
- Special weapons and standard special abilities
- Out of Action, Temporary Insanity and Shock tables, with their RollTables
- Pregenerated characters: one per archetype
- Creatures from the core book
- Macros: table rolls, display of the GM Manager
