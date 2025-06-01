5.0.0
- Compatibility with Foundry V13

4.4.0
- Update compendiums Archetype and Abilities to revised edition
- Enrichers : fix char instead of cha
- Minor css fixes

4.3.1
- Fix bug on enricher of type cha
- Minor css fix : html text in edit mode in prose mirror

4.3.0
- Add roll enricher to allow custom linked in journals, actors or items
- Refactoring of GM Manager to use AppV2
- Manage Fortune depending of version
- Change Fortune's icons
- Remove V1 roll : only V2 roll right now

4.2.1
- Fix chat's labels for rolls asked from the GM Manager

4.2.0
- Roll V2 : by default the visibility in the Dialog is the same as the default visibiity in the Chat

4.1.0
- Add advantage select to Resource and Material roll

4.0.0
- Revised version updates
- Save success is now less or equal instead of less : applied in V1 and V2
- Display max of a ressource only with a tooltip in Locked Mode
- New Revised Setting : to activate V2 features
- New Roll if Revised setting is on : new dialog window. Can choose bonus from standard abilities, custom abilities, occupation, and skills (revised only)
- New Setting : display adversary malus, used with Revised version option
- New Roll : can used adversary malus of a target if the option is on
- Players status menu is now a toggle
- Revised hotbar drop and now Resource, Save, Damage can be dropped
- Ability : key can't be changed and is now generated from the name

3.0.2
- GM Manager : Fix Roll for all for Wealth

3.0.1
- Fix the automatic decrease in case of failure for ressources : miscellaneous, wealthDice, hitDice

3.0.0
- Compatibility V12 : The async option for Roll#evaluate has been removed

2.9.2
- Add maximum compatibiliy to V11

2.9.1
- Fix font color of chat result from random tables
- GM Manager : Add click on character name to open the character sheet
- GM Manager : Add tooltip on character name to display abilities and magics items name

2.9.0
- CSS system can now be customized by a module

2.8.1
- Fix potential error in character's abilitites : allow undefined in model

2.8.0
- Change option about HitDice and HitPoints settings : Now the option is no more a boolean but has 3 values : HD, HP or both
- Fix missing description expand
- Refresh of character sheet if Fortune Value Setting is changed
- Add context menu to Increase or Decrease Fortune value (GM only) : instead of the use button
- Update gm-manager design and display according to the new options
- By default, compendium are hidden to players
- Send item's description to the chat for all players or only the GM
- Add locked: true to many items (all except abilites and opponents)

2.7.1
- Fix objects links in NPC descriptions

2.7.0
- Fix empty packs, which are now in YAML and not in JSON

2.6.0
- Fix display in chat
- Change the way to do packs and fix some opponent's description
- Add search on right click on character (for pregenerated characters)
- Fix display of long image in character sheet
- Fix background color of GM Manager

2.5.0
- Rework on all actors : DataModels usage and new sheet organization
- Lot of new features : short description for actors
- Add Sheet locked/unlocked feature for character and opponent sheets
- Update search feature to use toggle button
- Add 3 new values for Per Usage : by day, by night, per moment

2.0.0
- Rework on all items : DataModels usage and new sheet organization
- Add Sheet locked/unlocked feature
- Rework of NPC Character sheet
- Add search feature : to be able to search in journals and items
- Use packFolders to display compendiums in directories
 
1.5.2
- Fix expand ability on actor sheet

1.5.1
- Fix type select in item of type magic

1.5.0
- Add new item type : magic item for spell and ritual
- Display magic on abilities tab

1.4.2
- Technical release

1.4.1 (V11)
- Add missing Scenario value for usage

1.4.0 (V11)
- V11 compatibility

1.3.1 (V10)
- Add missing Scenario value for usage

1.3.0 (V10)
- Technical release to fix maximum version to Foundry 10

1.2.9
- Fix drop acteur ou journal
- Display dice only if dice damage is defined
- Opponent sheet rework : remove attacks'tab to have everything in the same page

1.2.8
- Fix worlds counter api's url

1.2.7
- Add background image to connexion window
- For opponent, don't calculate malus as a derived value. The malus' value is changed if the HitDice value is changed, but the malus'value could be manually changed
- Add a call to worlds counter api

1.2.6
- Change github repository

1.2.5
- Add a system menu in Control Buttons for the GM : first action is to display the GM Manager
- GM Manager : add a sound when a single player is notified for a roll

1.2.4
- Two new options to hide FR or EN system compendiums

1.2.3
- Fix bug on archetype, occupation and saves updates
- Update Font : font EBGaramond not available on Google
- Update item creation from the sheet : click to create an item and Shift + click to create a weapon
- New type of usage : per scenario
- Fix macro creation on hotbar : no more duplicate creation, one for system, one for generic
- Fix editor asynchronous enrichment since V10

1.2.2
- Fix bug on archetype, occupation and saves updates

1.2.1
- Fix bug for Token Action HUD

1.2.0
- v10 compatible version
- Use standard ToolTips
- Change the option about Wealth to allow : no, fixed or resource
- Change the order of displaying the character sheet depending of options : first line for resources, second line for combat

1.1.1
- Add button for players in the chat when a roll is asked

1.1.0
- Add to GM Manager the ability to ask for a roll

1.0.1
- Fix english translation
- Remove sheet's opening by default of a dropped item

1.0.0
- Add compendiums' English translation 

0.9.9
- Improve english translation thanks to Limpar

0.9.8
- Fix issue with color of succes/failure

0.9.7
- Add rollWeaponMacro : click for save with automatic choice, SHIFT + Click for material roll
- Add modifier malus depending of target
- Update chat message design for rolls : difficulty displayed and modifier applied on it, dice result is now displayed
- Add notes tab
- Global design improvement for all sheets

0.9.6
- Add customized dices and Dice So Nice configuration

0.9.5
Technical release to move from Gitlab to Github

0.9.4
Technical release

0.9.3
Technical release

0.9.2
- Images change : pause logo and above left menu
- Add a new GM only windows : display ressources summary for each connected player

0.9.1
- Update to V9 version
- Fix drag and drop in hotbar : no more macro's duplication

0.8.9.4
- Update all opponent data (hitdice and armor malus)
- Add localization of actor and item types
- Fix wrong chat message displayed (#6)

0.8.3
- Add per scene value to ability's usage type

0.8.2
- Fix error during ability deletion

0.8.1
- Fix delete definition item

0.8.0
- Compatible version with Foundry 0.8.6

0.7.3
- Add double advantage and double disadvantage for rolls : Saves, Resources, Weapons, Material of a character
- Update dice roll interface with tooltips
- Change tooltip's design and position for Saves and Resources

0.7.2
- Fix miscellaneous resource

0.7.1
- Fix for Token Action HUD

0.7.0
- Add macros creation and hotbar management
- Refactor to be compatible with Token Action HUD

0.6.3
- Improve chat display

0.6.1
- Automatic descrease if Material roll failed
- Remove rollable if resource at 0

0.6.0
- Template update
- Highlights success or failure in chat message
- Allow a miscellaneous resource in option
- Add custom abilities management

0.5.0
- Global improve of design, in particular with dices images
- Refactor of templates select
- Change actor sheet background image
- Refresh all open actor sheets if settings are changed

0.4.4
 Technical release
 
0.4.3
- Change Fortune use management :
  - Remove spend button for players
  - Display button for GM if there is enough tokens
  - Add message about the use in the chat for all
- Minor fixes

0.4.2
- Fix advantage and disadvantage for armed and unarmed roll
- Fix sheet template choice

0.4.1
- Add opponents compendium
- Add macros compendium

0.4.0
- Add button reset of usage for capacity
- Add Active Effect to out of actions status
- Add icon on token for conditions

0.3.16
- Add out-of-action conditions display
- Add read only keys for all conditions

0.3.10 to 0.3.14
- Technical releases to improve package delivery

0.3.9
- Add new item type : definition
- Add compendium of rolltable Out of Action (Hors jeu)
- Add compendium of Out of Action (Hors jeu) items

0.3.8 : technical release
0.3.7 : technical release

0.3.6
- Add missing js files to opponent refactor

0.3.5
- Refactor opponent sheet to allow damage dice field and roll

0.3.4
- Add expendable description for opponent's item
- Change hp calculation for opponent : field is now editable

0.3.3
- Add special weapons compendium 
- Add attack'd description field

0.3.2 Features
--------------

Actor
- Character
    - Add/modify/delete objects and special abilities
    - Save roll with advantage/disadvantage/bonus/malus, display of the possible advantage given by a special ability
    - Resource roll with advantage/disadvantage/bonus/malus and decrease management
- Opponent
    - Attacks are items

Item
- Ability: special ability
- Item : management of the supplies die with the possibility to make a roll (known limitation : in case of loss of resource, the die must be decreased by hand)
- Weapon: for weapons, drag and drop on the character sheet
- Attack: opponent's attacks, to be dragged on the opponent's card

Options
- Fortune: activates/deactivates the display on the form
    - The GM activates the option and makes the number of tokens available to the players.
    - Display of the number of tokens under the portrait and possibility to spend for a player (known limitation: after spending, you have to close and open the card to see the remaining number updated)
- Adrenaline: activates/deactivates the display on the card
    - Under the portrait: token lightning for the player, skull and crossbones for the GM.
- Hit dice as a resource: activates/deactivates the display on the form
- Wealth as a resource: enables/disables display on the form

Compendiums
- Only in French right now
