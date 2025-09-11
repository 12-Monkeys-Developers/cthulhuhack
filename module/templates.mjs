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

    // CHAT
    "systems/cthack/templates/chat/tooltip.hbs",
  ]

  // Load the template parts
  return foundry.applications.handlebars.loadTemplates(templatePaths)
}
