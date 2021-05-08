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
        if (tokens.length > 1) return ui.notifications.warn("Vous avez sélectionné plusieurs tokens.");
        const token = canvas.tokens.controlled[0];

        const actor = token ? token.actor : null;
        if (!actor) return ui.notifications.warn("Aucun token n'est sélectionné.");

        // Check the actor has the item
        let item = actor.getOwnedItem(itemId);
        if (!item) return ui.notifications.warn(`L'objet ${itemName} n'est pas dans l'inventaire de ${actor.data.name}.`);

        // Open the roll window if the item uses resource and is not at 0
        if (item.data.data.dice === '') {
            return ui.notifications.warn(`L'objet ${itemName} n'est pas un objet à ressource.`);
        }
        if (item.data.data.dice === '0') {
            return ui.notifications.warn(`L'objet ${itemName} n'a plus de ressources.`);
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
        if (tokens.length > 1) return ui.notifications.warn("Vous avez sélectionné plusieurs tokens.");
        const token = canvas.tokens.controlled[0];

        const actor = token ? token.actor : null;
        if (!actor) return ui.notifications.warn("Aucun token n'est sélectionné.");

        // Check the actor has the item
        let item = actor.getOwnedItem(itemId);
        if (!item) return ui.notifications.warn(`${actor.data.name} n'a pas l'attaque ${itemName}.`);

        // Open the roll window
        actor.rollAttackDamageRoll(item);
	};    
}
