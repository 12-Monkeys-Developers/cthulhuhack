# Système Cthulhu Hack pour Foundry VTT

<div align="center">

![Supported Foundry VTT versions](https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fversion%3Fstyle%3Dflat%26url%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2FQaw%2Fcthulhuhack%2Fmain%2Fsystem.json)
![Latest Release](https://img.shields.io/github/v/release/Qaw/cthulhuhack?label=Latest%20release)

</div>

Cthulhu Hack est un jeu de rôle de Paul Baldowski édité par <a href="http://www.justcrunch.com">Just Crunch Games</a>.
Cthulhu Hack est édité en version française par <a href="https://www.les12singes.com">Les XII Singes</a> sous le nom Cthulhu Hack VF.
Cthulhu Hack VF fait partie de la collection Dark Monkeys.

La marque Cthulhu Hack VF, le logo Cthulhu Hack VF, la marque Dark Monkeys, le logo Dark Monkeys, la marque Les XII Singes, le logo Les XII Singes sont la propriété de ReSpell.
La marque Cthulhu Hack, le logo Cthulhu Hack, la marque Just Crunch Games, le logo Just Crunch Games sont la propriété de Just Crunch Games.

Les visuels utilisés sur Foundry VTT sont réalisés par Maxime Plasse (https://www.maxsmaps.com/). Ils sont fournis pour l'utilisation de Foundry VTT. Toute autre utilisation ou reproduction d'image doit obtenir l'accord de ReSpell / Les XII Singes.

Rejoignez la communauté Discord FR : <a href='https://discord.gg/pPSDNJk'>Foundry VTT Discord FR</a>

Ce système est développé par Kristov, avec la contribution de Lightbringer pour les compendiums et les tests.


----------------
Fonctionnalités 
----------------
version : 1.2.4

Modules supportés avec une adaptation spécifique :
- Token Action HUD
- Dice So Nice

Actor
- Personnage
    - Ajout/modification/suppression des objets et des capacités spéciales
    - Jet de sauvegarde avec avantage/désavantage/double avantage/double désavantage/bonus (Modificateur positi)/malus (Modificateur négatif), affichage de l'avantage éventuel donné par une capacité
    - Jet de ressource avec avantage/désavantage/double avantage/double désavantage/bonus/malus et gestion de la diminution
- Opposant
    - Les attaques sont sous forme d'item avec jet de dommages intégré

Item
- Ability : capacité spéciale
    - Si les champs "Custom" et "Donne un avantage" sont activés, le champ Description avantage est utilisé dans l'aide au jet de dé
- Item : 
    - Gestion du dé de matériel avec possibilité de faire un jet
    - Depuis la fiche : clic pour créer un objet et Shift + clic pour créer une arme
- Weapon : pour les armes, à faire glisser sur la fiche de personnage
- Attack : les attaques, à faire glisser sur la fiche d'opposant
- Definition : utilisé pour les statuts des tables Hors Jeu, Folie temporaire et Choc ; ajouté au personnage via drag and drop
    - Prise en compte du désavantage pour certains statuts Hors Jeu
    - Une icône apparait sur le token en cas de condition
- Clic sur le nom pour déplier la description
- Possibilité de trier les capacités et les objets (dans la catégorie Armes ou Equipement) en faisant glisser un objet

Options
- Afficher les compendiums français : si cette option est désactivée, les compendiums qui commencent par FR sont cachés
- Afficher les compendiums anglais : si cette option est désactivée, les compendiums qui commencent par EN sont cachés
- Fortune : active/désactive l'affichage sur la fiche
    - Le MJ active l'option et met le nombre de jetons disponibles pour les joueurs
    - Affichage du nombre de jetons restant sous le portrait
    - Possibilité d'en dépenser un uniquement pour un MJ
    - La dépense est affichée pour tout le monde dans le chat
- Adrenaline : active/désactive l'affichage sur la fiche
    - Sous le portrait : jeton éclair pour le joueur, jeton tête de mort pour le MJ
- Dé de vie en tant que ressource : active/désactive l'affichage sur la fiche
- Richesse en tant que ressource : active/désactive l'affichage sur la fiche
- Resource diverse : si le champ est rempli, alors une nouvelle ressource portant ce nom est activée en remplacement de la resource Richesse

Barre de macros
- Glisser un acteur : permet d'ouvrir la fiche. Ne peut être créé que par le MJ, mais il peut le faire pour un joueur et lui partager la macro créée.
- Glisser un article : permet de l'ouvrir directement
- Glisser un item
    - Equipement d'un personnage : s'il reste des ressources, permet d'ouvrir la fenêtre de lancer de dés correspondante
    - Attaque d'un opposant : permet d'ouvrir la fenêtre de dommages
    - Capacité : si c'est une capacité qui a un nombre d'usages limité seulement. Permet d'utiliser la capacité une fois. Mettre Maximum vide au lieu de 0 pour les capacités non utilisables
- Pour utiliser une macro il faut sélectionner le token qui peut l'utiliser

Compendiums
- Archétypes standards (avec les variations pour le savant) : Drag and drop sur la fiche de perso qui remplace les valeurs de la fiche par celles de l'archetype
- Armes spéciales
- Capacités spéciales : contient toutes les capacités standards
    - Drag and drop pour ajouter à la fiche (avec prise en compte des capacités multiples)
    - Gestion du nombre d'utilisations et affichage de la date de dernier usage lors du clic sur l'utilisation
    - Un bouton pour réinitialiser le nombre d'usages et la date de dernier usage
    - Clic sur le nom pour déplier la description
- Table Hors Jeu
- Table Folie Passagère
- Table Choc
- RollTable sur les 3 tables
- Prétirés : un prétiré par archétype avec les capacités spéciales, il suffit de choisir laquelle supprimer
- Créatures : les créatures du livre de base
- Macros : Jet sur chacun des 3 tables, commande pour faire apparaitre le fenêtre du statut des joueurs

-------------------------------------------------------------------------------------------------------------------------
Cthulhu Hack System for Foundry VTT

The Cthulhu Hack is a role playing game created by Paul Baldowski published by <a href="http://www.justcrunch.com">Just Crunch Games</a>. The Cthulhu Hack trademark, the Cthulhu Hack logo, the Just Crunch Games trademark and the Just Crunch Games logo are the property of Just Crunch Games.

The Cthulhu Hack is published in French by <a href="https://www.les12singes.com">Les XII Singes</a> under the name Cthulhu Hack VF. Cthulhu Hack VF is part of the Dark Monkeys collection. The Cthulhu Hack VF trademark, the Cthulhu Hack VF logo, the Dark Monkeys trademark, the Dark Monkeys logo, the XII Monkeys trademark and the XII Monkeys logo are the property of ReSpell.

The graphics used for Foundry VTT are produced by Maxime Plasse (https://www.maxsmaps.com/). They are provided for Foundry ATV use. Any other use or reproduction of images must obtain the agreement of ReSpell / Les XII Singes.

Join the Discord FR community: <a href='https://discord.gg/pPSDNJk'>Foundry VTT Discord FR</a>

This system is developed by Kristov, with the contribution of Lightbringer for the compendiums and tests.
Thanks to Limpar for the English translation of the compendiums.

---------------
Features
---------------
version : 1.2.4

Supported modules with specific adaptation:
- Token Action HUD
- Dice So Nice

Actor
- Character
    - Add/modify/delete objects and special abilities
    - Save roll with advantage/disadvantage/bonus/penalty, display of the possible advantage given by a special ability
    - Resource roll with advantage/disadvantage/bonus/penalty and reduction management
- Opponent
    - Attacks are in the form of an item with an integrated damage roll

Item
- Ability: special ability
    - If the "Custom" and "Gives advantage" fields are activated, the advantage description field is used in the dice roll aid
- Item : 
    - Management of the supplies die with the possibility to make a roll
    - On the sheet : click to create an item and Shift + click to create a weapon
- Weapon: for weapons, drag and drop on the character sheet
- Attack: attacks to be dragged onto the opponent's sheet
- Definition: used for Out of Play, Temporary Insanity and Shock table statuses; added to character via drag and drop
    - Taking into account the disadvantage for certain Out-of-Play statuses
    - An icon appears on the token in case of condition
- Click on the name to display the description
- Ability to sort abilities and items (in Weapons or Equipment category) by dragging an item

Options
- Display french compendiums : if this option is disabled, the compendiums which begin by FR are hidden
- Display english compendiums : if this option is disabled, the compendiums which begin by EN are hidden
- Fortune: activates/deactivates the display on the form
    - The GM activates the option and makes the number of tokens available to the players.
    - Display of the number of tokens under the portrait
    - Only a GM can spend a token
    - A message is displayed in the chat when a token is spent
- Adrenaline: activates/deactivates the display on the card
    - Under the portrait: lightning token for the player, skull & crossbones token for the GM.
- Hit Dice as a resource: activates/deactivates the display on the form
- Wealth as a resource: enables/disables display on the form
- Miscellaneous option : if the field is filled, this is used as a resource and will replace the Wealth resource

Macro bar
- Drag and drop an actor: opens the form. Can only be created by the GM, but he can do it for a player and share the created macro with the player.
- Drag and drop an item: allows you to open it directly
- Click on an item
    - Character's equipment : if there are resources left, opens the corresponding dice roll window
    - Opponent's attack : opens the damage window
    - Ability : if it is an ability that has a limited number of uses. Allows you to use the ability once. Sets the Maximum empty instead of 0 for non usable abilities
- To use a macro you have to select the token that can use it

Compendiums
- Standard archetypes (with variations for the Scholar) : Drag and drop on the character sheet which replaces the values of the sheet by those of the archetype
- Special weapons
- Special abilities : contains all the standard abilities
    - Drag and drop to add to the card (taking into account multiple abilities)
    - Management of the number of uses and display of the last use date when clicking on the use
    - A button to reset the number of uses and the last use date
    - Click on the name to display the description
- Out of action Table
- Tomporary insanity table
- Shock table
- RollTable on the 3 tables
- Presets : one preset per archetype with special abilities, just choose which one to delete
- Creatures : the creatures of the basic book
- Macros : Roll on each of the 3 tables, command to display the player status window
