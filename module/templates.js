/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
	// Define template paths to load
	const templatePaths = [
		// ACTOR		
		'systems/cthack/templates/sheets/character.hbs',
		'systems/cthack/templates/sheets/parts/character-sidebar.hbs',
		'systems/cthack/templates/sheets/parts/character-equipment.hbs',
		'systems/cthack/templates/sheets/parts/character-abilities.hbs',
		'systems/cthack/templates/sheets/parts/character-item.hbs',
		'systems/cthack/templates/sheets/parts/character-ability.hbs',
		'systems/cthack/templates/sheets/parts/character-magic.hbs',
		'systems/cthack/templates/sheets/opponent.hbs',

		// ITEM
		'systems/cthack/templates/sheets/ability.hbs',
		'systems/cthack/templates/sheets/archetype.hbs',
		'systems/cthack/templates/sheets/attack.hbs',
		'systems/cthack/templates/sheets/definition.hbs',
		'systems/cthack/templates/sheets/item.hbs',
		'systems/cthack/templates/sheets/weapon.hbs',
		'systems/cthack/templates/sheets/magic.hbs',
		
		// DICE
		'systems/cthack/templates/parts/dice-sides-options-value.hbs',
		'systems/cthack/templates/parts/dice-sides-options-max.hbs',
		'systems/cthack/templates/parts/dice-sides-options-damage.hbs',

		// CHAT
		'systems/cthack/templates/chat/rollSave.hbs',
		'systems/cthack/templates/chat/rollResource.hbs',
		'systems/cthack/templates/chat/tooltip.hbs',
		'systems/cthack/templates/chat/askRoll.hbs',

		// APP
		'systems/cthack/templates/app/gm-manager.hbs',
		'systems/cthack/templates/app/gm-player.hbs'
	];

	// Load the template parts
	return loadTemplates(templatePaths);
};
