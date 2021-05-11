Système Cthulhu Hack pour Foundry VTT

Cthulhu Hack est un jeu de rôle de Paul Baldowski édité par <a href="http://www.justcrunch.com">Just Crunch Games</a>.
Cthulhu Hack est édité en version française par <a href="https://www.les12singes.com">Les XII Singes</a> sous le nom Cthulhu Hack VF.
Cthulhu Hack VF fait partie de la collection Dark Monkeys.

La marque Cthulhu Hack VF, le logo Cthulhu Hack VF, la marque Dark Monkeys, le logo Dark Monkeys, la marque Les XII Singes, le logo Les XII Singes sont la propriété de ReSpell.
La marque Cthulhu Hack, le logo Cthulhu Hack, la marque Just Crunch Games, le logo Just Crunch Games sont la propriété de Just Crunch Games.

Les visuels utilisés sur Foundry VTT sont réalisés par Maxime Plasse (https://www.maxsmaps.com/). Ils sont fournis pour l'utilisation de Foundry VTT. Toute autre utilisation ou reproduction d'image doit obtenir l'accord de ReSpell / Les XII Singes.

Ce système est en cours de développement.
Rejoignez la communauté Discord FR : <a href='https://discord.gg/pPSDNJk'>Foundry VTT Discord FR</a>

Ce système est développé par Kristov, avec la contribution de Lightbringer pour les compendiums et les tests

----------------
Fonctionnalités 
----------------
version : 0.7.2

Actor
- Personnage
    - Ajout/modification/suppression des objets et des capacités spéciales
    - Jet de sauvegarde avec avantage/désavantage/bonus/malus, affichage de l'avantage éventuel donné par une capacité
    - Jet de ressource avec avantage/désavantage/bonus/malus et gestion de la diminution
- Opposant
    - Les attaques sont sous forme d'item avec jet de dommages intégré

Item
- Ability : capacité spéciale
    - Si les champs "Custom" et "Donne un avantage" sont activés, le champ Description avantage est utilisé dans l'aide au jet de dé
- Item : gestion du dé de matériel avec possibilité de faire un jet
- Weapon : pour les armes, à faire glisser sur la fiche de personnage
- Attack : les attaques, à faire glisser sur la fiche d'opposant
- Definition : utilisé pour les statuts des tables Hors Jeu, Folie temporaire et Choc ; ajouté au personnage via drag and drop
    - Prise en compte du désavantage pour certains statuts Hors Jeu
    - Une icône apparait sur le token en cas de condition
- Clic sur le nom pour déplier la description
- Possibilité de trier les capacités et les objets (dans la catégorie Armes ou Equipement) en faisant glisser un objet

Options
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

-------------------------------------------------------------------------------------------------------------------------
Cthulhu Hack System for Foundry VTT

Cthulhu Hack is a role playing game created by Paul Baldowski.

Cthulhu Hack is edited in French by <a href="https://www.les12singes.com">Les XII Singes</a>.
The visuals are those of the Cthulhu Hack version of the XII Monkeys.

The original game is edited by <a href="http://www.justcrunch.com">Just Crunch Games</a>.

This system is under development.

---------------
Features
---------------
version : 0.7.2

Actor
- Character
    - Add/modify/delete objects and special abilities
    - Save roll with advantage/disadvantage/bonus/malus, display of the possible advantage given by a special ability
    - Resource roll with advantage/disadvantage/bonus/malus and decrease management
- Opponent
    - Attacks are items

Item
- Ability: special ability
- Item : management of the supplies die with the possibility to make a roll
- Weapon: for weapons, drag and drop on the character sheet
- Attack: opponent's attacks, to be dragged on the opponent's card
- Definition: used for Out of Game, Temporary Insanity and Shock table statuses; added to character via drag and drop
    - Taking into account the disadvantage for certain Out-of-Game statuses
    - An icon appears on the token in case of condition
- Click on name to display description

Options
- Fortune: activates/deactivates the display on the form
    - The GM activates the option and makes the number of tokens available to the players.
    - Display of the number of tokens under the portrait
    - Only a GM could spend a token
    - A message is displayed in the chat when a token is spent
- Adrenaline: activates/deactivates the display on the card
    - Under the portrait: lightning token for the player, skull and crossbones token for the GM.
- Hit dice as a resource: activates/deactivates the display on the form
- Wealth as a resource: enables/disables display on the form
- Miscellaneous option : if the field is filled, this is used as a resource and will replace Wealth resource

Hotbar
- Macro creation with Actor
- Macro creation with Items

Compendiums
- Only in French right now