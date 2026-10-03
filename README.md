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

Version 6.1.2 — compatible Foundry VTT V14. Le détail des évolutions est dans le [CHANGELOG](CHANGELOG.md).

### Modules supportés avec une adaptation spécifique
- Token Action HUD Classic
- Dice So Nice (dés personnalisés)

### Personnage
- Fiche verrouillable / déverrouillable avec onglet de notes
- Objets, armes et capacités spéciales ajoutables, modifiables et triables par glisser-déposer ; clic sur le nom pour déplier la description
- Capacités à usages limités (par jour, scène, scénario…) avec date de dernier usage et bouton de réinitialisation
- Objets magiques (sorts et rituels)
- Dé de matériel, ressources (dé de vie ou PV, richesse, ressource diverse) avec diminution automatique en cas d'échec
- Taille / encombrement des objets (option)
- Création rapide : clic pour un objet, Shift + clic pour une arme

### Opposant
- Fiche en deux onglets : description, puis attaques / capacités / sorts
- Attaques sous forme d'items avec jet de dégâts intégré

### Jets de dés
- Sauvegardes, ressources, matériel et armes avec avantage, désavantage, double avantage / désavantage, bonus et malus
- Fenêtre de jet unique prenant en compte les capacités, l'occupation et les compétences (version révisée : réussite si résultat ≤ seuil)
- Malus de l'adversaire ciblé (option)
- Dégâts simultanés (option) : un jet d'arme contre un opposant ciblé enchaîne le jet de dégâts
- Icône et nom du personnage affichés dans les messages de tchat
- Enrichers `@jet` pour créer des liens de jet dans les journaux, acteurs et objets

### Conditions
- Items « Définition » pour les tables Hors jeu, Folie passagère et Choc, ajoutés par glisser-déposer
- Icône sur le token et prise en compte automatique des désavantages

### Outils du MJ
- Gestionnaire MJ : ressources et capacités des joueurs connectés, demande de jet à tous ou à un joueur, gestion de la Fortune
- Menu système dans les contrôles de la scène
- Recherche dans les journaux et les objets
- Envoi de la description d'un objet au tchat

### Barre de macros
- Glisser un acteur, un article, un objet, une capacité, une sauvegarde, une ressource, un jet de dégâts ou une attaque / un sort d'opposant crée la macro correspondante
- Le token concerné doit être sélectionné pour utiliser la macro

### Options
- Afficher / masquer les compendiums français ou anglais
- Fortune (jetons dépensés par le MJ, annoncés dans le tchat) et Adrénaline
- Dé de vie, points de vie ou les deux ; richesse ou ressource diverse
- Taille (encombrement), version révisée, malus d'adversaire, dégâts simultanés
- Style CSS personnalisable par un module

### Compendiums
- Archétypes (révisés, avec les variantes du savant) : glisser sur la fiche pour la remplir
- Armes spéciales et capacités spéciales standards
- Tables Hors jeu, Folie passagère et Choc, avec leurs RollTables
- Prétirés : un par archétype
- Créatures du livre de base
- Macros : jets sur les tables, affichage du gestionnaire MJ
