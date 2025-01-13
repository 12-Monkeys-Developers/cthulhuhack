/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  // Define template paths to load
  const templatePaths = [
    // ACTOR
    "systems/cthack/templates/sheets/character.hbs",
    "systems/cthack/templates/sheets/parts/character-sidebar.hbs",
    "systems/cthack/templates/sheets/parts/character-equipment.hbs",
    "systems/cthack/templates/sheets/parts/character-abilities.hbs",
    "systems/cthack/templates/sheets/parts/character-ability.hbs",
    "systems/cthack/templates/sheets/parts/character-magic.hbs",
    "systems/cthack/templates/sheets/opponent.hbs",

    // ITEM
    "systems/cthack/templates/sheets/ability.hbs",
    "systems/cthack/templates/sheets/archetype.hbs",
    "systems/cthack/templates/sheets/attack.hbs",
    "systems/cthack/templates/sheets/definition.hbs",
    "systems/cthack/templates/sheets/item.hbs",
    "systems/cthack/templates/sheets/weapon.hbs",
    "systems/cthack/templates/sheets/magic.hbs",

    // CHAT
    "systems/cthack/templates/chat/roll-save.hbs",
    "systems/cthack/templates/chat/roll-resource.hbs",
    "systems/cthack/templates/chat/roll-other.hbs",
    "systems/cthack/templates/chat/tooltip.hbs",
  ]

  // Load the template parts
  return loadTemplates(templatePaths)
}
