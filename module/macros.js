export class Macros {

    /**
     * @name rollItemMacro
     * @description Roll the item
     *              Check that only one token is selected and he has the object
     * @public
	 * 
     * @param {*} itemId
     * @param {*} itemName 
	 * 
     * @returns     Launch the item roll window
     */    
	static rollItemMacro = async function(itemId, itemName) {
        // Check only one token is selected
        const tokens = canvas.tokens.controlled;
        if (tokens.length > 1) return ui.notifications.warn(game.i18n.localize('MACROS.MultipleTokensSelected'));
        const token = canvas.tokens.controlled[0];

        const actor = token ? token.actor : null;
        if (!actor) return ui.notifications.warn(game.i18n.localize('MACROS.NoTokenSelected'));

        // Check the actor has the item
        let item = actor.getOwnedItem(itemId);
        if (!item) return ui.notifications.warn(game.i18n.format('MACROS.ObjectNotInInventory',{itemName:itemName, actorName: actor.data.name }));

        // Open the roll window if the item uses resource and is not at 0
        if (item.data.data.dice === '') {
            return ui.notifications.warn(game.i18n.format('MACROS.ObjectWithoutResource',{itemName:itemName }));
        }
        if (item.data.data.dice === '0') {
            return ui.notifications.warn(game.i18n.format('MACROS.ObjectEmptyResource',{itemName:itemName }));
        }
        actor.rollMaterial(item);
	};

    /**
     * @name rollAttackMacro
     * @description Roll the item
     *              Check that only one token is selected and he has the object
     * @public
	 * 
     * @param {*} itemId
     * @param {*} itemName 
	 * 
     * @returns     Launch the item roll window
     */    
     static rollAttackMacro = async function(itemId, itemName) {
        // Check only one token is selected
        const tokens = canvas.tokens.controlled;
        if (tokens.length > 1) return ui.notifications.warn(game.i18n.localize('MACROS.MultipleTokensSelected'));
        const token = canvas.tokens.controlled[0];

        const actor = token ? token.actor : null;
        if (!actor) return ui.notifications.warn(game.i18n.localize('MACROS.NoTokenSelected'));

        // Check the actor has the item
        let item = actor.getOwnedItem(itemId);
        if (!item) return ui.notifications.warn(game.i18n.format('MACROS.AttackNotFound',{opponentName:actor.data.name, itemName: itemName }));

        // Open the roll window
        actor.rollAttackDamageRoll(item);
	};    
}
