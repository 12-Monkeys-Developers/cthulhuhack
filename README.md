# Système Cthulhu Hack pour Foundry VTT

🇬🇧 [English version](README.en.md)

<div align="center">

![Supported Foundry VTT versions](https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fversion%3Fstyle%3Dflat%26url%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2F12-Monkeys-Developers%2Fcthulhuhack%2Fmain%2Fsystem.json)
![Latest Release](https://img.shields.io/github/v/release/12-Monkeys-Developers/cthulhuhack?label=Latest%20release)

</div>

Cthulhu Hack est un jeu de rôle de Paul Baldowski édité par <a href="http://www.justcrunch.com">Just Crunch Games</a>.
Cthulhu Hack est édité en version française par <a href="https://www.les12singes.com">Les XII Singes</a> sous le nom Cthulhu Hack VF.
Cthulhu Hack VF fait partie de la collection Dark Monkeys.

La marque Cthulhu Hack VF, le logo Cthulhu Hack VF, la marque Dark Monkeys, le logo Dark Monkeys, la marque Les XII Singes, le logo Les XII Singes sont la propriété de ReSpell.
La marque Cthulhu Hack, le logo Cthulhu Hack, la marque Just Crunch Games, le logo Just Crunch Games sont la propriété de Just Crunch Games.

Les visuels utilisés sur Foundry VTT sont réalisés par Maxime Plasse (https://www.maxsmaps.com/). Ils sont fournis pour l'utilisation de Foundry VTT. Toute autre utilisation ou reproduction d'image doit obtenir l'accord de ReSpell / Les XII Singes.

Rejoignez la communauté Discord FR : <a href='https://discord.gg/pPSDNJk'>Foundry VTT Discord FR</a>

Ce système est développé par Kristov, avec la contribution de Lightbringer pour les compendiums et les tests.
Merci à Limpar pour la traduction anglaise des compendiums.

## Fonctionnalités

Version 6.2.0 — compatible Foundry VTT V14. Le détail des évolutions est dans le [CHANGELOG](CHANGELOG.md).

Un **guide utilisateur** destiné au MJ, en français et en anglais, est fourni dans les compendiums « FR - Guide du système » et « EN - System guide ».

### Modules supportés avec une adaptation spécifique
- Token Action HUD Cthulhu Hack (avec Token Action HUD Core)
- Dice So Nice (dés personnalisés)

### Personnage
- Fiche verrouillée par défaut, déverrouillable par un interrupteur dans la barre de titre ; les dépôts ne sont acceptés que sur une fiche déverrouillée
- Onglets Description, Équipement, Capacités & Magie et Notes
- Objets, armes, capacités et sorts ajoutés par glisser-déposer ou par les boutons + (clic : arme, Maj + clic : objet) ; clic sur une ligne pour déplier sa description
- Clic droit sur un élément : envoyer sa description dans le tchat, éditer, supprimer
- Capacités à usages limités (par jour, scène, scénario…) avec date du dernier usage ; clic droit pour Utiliser, Augmenter ou Réinitialiser
- Sortilèges et rituels avec jet de sanité
- Dé de matériel, ressources (Torche, Bagou, Santé mentale, richesse, ressource diverse) avec diminution automatique en cas d'échec
- Encombrement des armes et des objets (option)
- Archétype déposé sur la fiche : renseigne les ressources, le dé de vie, la richesse et les dégâts

### Adversaire
- Fiche en deux onglets : description, puis attaques / capacités / sorts
- Changer les dés de vie recalcule les PV maximum et le malus
- Attaques avec dé de dégâts et dégâts fixes

### Jets de dés
- Sauvegardes, ressources, matériel, sanité, dégâts et attaques
- Fenêtre de jet unique : cible, attaque Armée / Sans arme, malus de 0 à −10, seuil final, modificateurs cliquables (métier, compétences en réédition, capacités), avantage et désavantage simples ou doubles, visibilité du lancer
- Malus de l'Adversaire ciblé reporté automatiquement (option)
- Cartes de jet : jetons de l'acteur et de sa cible, dés écartés grisés, détail du seuil, bandeau Réussite / Échec, ressource perdue
- Combat sur une seule carte contre un Adversaire ciblé : dégâts du personnage en cas de réussite (automatiques avec l'option Dégâts simultanés), riposte choisie par le MJ en cas d'échec, bouton MJ « Appliquer » qui retire les dégâts des PV (armure déduite) ou jet de Dé de vie
- Enrichers `@jet` / `@roll` pour demander un jet à tous depuis un journal, un acteur ou un objet

### Conditions
- Items « Définition » Hors jeu, Folie passagère et Choc, ajoutés par glisser-déposer
- Icône sur le token ; désavantage automatique (Commotion, Titubant, Essouflé) et −4 aux sauvegardes physiques (Os brisés)

### Outils du MJ
- Onglet Cthulhu Hack dans la barre latérale : version, liens d'aide, gestionnaire de joueurs et recherche
- Gestionnaire de joueurs : ressources et sauvegardes des joueurs connectés, demande de jet à tous ou à un joueur
- Fortune : clic droit sur la Fortune d'une fiche pour l'utiliser (annonce dans le tchat) ou l'augmenter
- Recherche dans les journaux, les acteurs et les objets du monde, avec surlignage

### Barre de macros
- Glisser un acteur, un journal, une sauvegarde, une ressource, des dégâts, une arme (clic : attaque, Maj + clic : matériel), un objet, une capacité, un sort ou une attaque d'Adversaire crée la macro correspondante
- Les macros d'objet, d'arme, de capacité, de sort et d'attaque agissent sur le token sélectionné

### Options
- Réédition, Fortune et Adrénaline
- Points de vie, dés de vie ou les deux ; richesse et ressource diverse
- Encombrement, malus d'adversité, dégâts simultanés
- Style CSS personnalisable par un module

### Compendiums
- Rangés dans un dossier Cthulhu Hack, en sous-dossiers FR et EN
- Guide du système (MJ)
- Archétypes (révisés, avec les variantes du savant) : glisser sur la fiche pour la remplir
- Armes spéciales et capacités spéciales standards
- Tables Hors jeu, Folie passagère et Choc, avec leurs RollTables
- Prétirés : un par archétype
- Créatures du livre de base
- Macros : jets sur les tables
