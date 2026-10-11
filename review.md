# Revue du système Cthulhu Hack

État au 11 octobre 2026. Les points sont classés par priorité, avec les bugs et failles en premier. « Traité » signifie qu'un correctif a été apporté au code ; les vérifications restantes sont précisées lorsqu'elles sont connues.

## Bugs et failles

1. **Non traité — critique : verrouiller les mises à jour de cartes transmises au MJ.** N'accepter qu'une action précise, puis valider ou recalculer côté MJ les champs modifiés et les jets ajoutés. Le gestionnaire accepte actuellement un `system` et des `rolls` fournis par le joueur. Voir [combat-card.mjs](module/chat/combat-card.mjs).

2. **Traité — critique : empêcher les cartes privées de révéler le résultat.** Quand `isContentVisible` vaut `false`, la carte du système ne remplace plus le rendu masqué de Foundry ; l'état du combat, les actions et les détails permettant de distinguer réussite et échec restent cachés. Le rendu privé des jets masque aussi les informations de l'ancien gabarit. Correctif : `e85cc6f`. Vérifié dans Foundry V14 avec un test navigateur couvrant les jets aveugles, réservés au MJ et publics. Voir [chat-message.mjs](module/documents/chat-message.mjs) et [roll.mjs](module/documents/roll.mjs).

3. **Non traité — élevé : utiliser l'acteur du token pour tous les calculs d'un jet.** Résoudre l'acteur par son UUID, y compris pour les avantages de sauvegarde, afin de respecter les données des tokens non liés. Voir [roll.mjs](module/documents/roll.mjs).

4. **Non traité — élevé : sécuriser la génération des macros.** Ne plus insérer directement les noms d'objets dans du code exécutable ; gérer aussi le cas où l'objet recherché n'existe plus. Voir [macros.mjs](module/macros.mjs).

5. **Non traité — élevé : contrôler les messages socket relatifs à Fortune.** Vérifier qui demande le changement et refuser les valeurs invalides avant toute modification du réglage mondial. Voir [utils.mjs](module/utils.mjs).

6. **Non traité — moyen : rendre cohérent le cycle de vie des conditions et de leurs effets.** Attendre la création de l'effet, l'associer à l'objet par identifiant et assurer sa suppression quel que soit le moyen utilisé pour retirer l'objet. Voir [actor.mjs](module/documents/actor.mjs).

7. **Traité — moyen : inclure `sounds/` dans l'archive publiée.** Le dossier contenant `drums.wav` figure désormais dans la liste des fichiers empaquetés. Correctif : `6a4aa34`. La publication d'une archive complète n'a pas été vérifiée de bout en bout. Voir [main.yml](.github/workflows/main.yml).

8. **Non traité — faible : échapper la recherche avant de construire l'expression régulière.** Une saisie comme `(` ne doit pas faire échouer le surlignage. Voir [research.mjs](module/applications/research.mjs).

## Réduction du risque de régression

9. **Non traité : faire passer les tests Cthulhu Hack avant une publication.** La suite existe dans `foundry-e2e/e2e/cthack`, mais le workflow de release ne l'exécute pas. Ajouter en priorité des cas pour les points 1 à 5. Voir [main.yml](.github/workflows/main.yml).

10. **Non traité : découper le module des jets.** Séparer le dialogue, les règles de calcul et la construction des cartes aujourd'hui concentrés dans [roll.mjs](module/documents/roll.mjs).

11. **Non traité : retirer les hooks des feuilles fermées.** Chaque feuille de personnage installe actuellement son propre hook global `updateSetting`. Voir [character.mjs](module/applications/sheets/character.mjs).
