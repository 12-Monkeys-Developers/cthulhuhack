/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
	// Define template paths to load
	const templatePaths = [
		// ACTOR		
		'systems/cthack/templates/actor/actor-sheet.hbs',
		'systems/cthack/templates/actor/parts/actor-attributes-resources.hbs',
		'systems/cthack/templates/actor/parts/actor-attributes-combat.hbs',
		'systems/cthack/templates/actor/parts/actor-item.hbs',
		'systems/cthack/templates/actor/parts/actor-condition.hbs',
		'systems/cthack/templates/actor/parts/actor-ability.hbs',
		'systems/cthack/templates/actor/opponent-sheet.hbs',
		'systems/cthack/templates/actor/parts/opponent-attack.hbs',

		// ITEM
		'systems/cthack/templates/item/ability-sheet.hbs',
		'systems/cthack/templates/item/archetype-sheet.hbs',
		'systems/cthack/templates/item/attack-sheet.hbs',
		'systems/cthack/templates/item/definition-sheet.hbs',
		'systems/cthack/templates/item/item-sheet.hbs',
		'systems/cthack/templates/item/weapon-sheet.hbs',
		'systems/cthack/templates/item/magic-sheet.hbs',
		
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
