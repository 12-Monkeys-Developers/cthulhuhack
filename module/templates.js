/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {

    // Define template paths to load
    const templatePaths = [
        // ACTOR
        "systems/cthack/templates/actor/parts/actor-attributes-first.hbs",
        "systems/cthack/templates/actor/parts/actor-attributes-second.hbs"
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};
