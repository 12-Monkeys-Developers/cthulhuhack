export class Macros {

    /**
     * @name rollItemMacro
     * @description Roll the item
     *              Check that only one token is selected and he has the item
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
        let item = actor.items.get(itemId);
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
     * @name rollWeaponMacro
     * @description Roll the weapon attack : Strength save if Range is empty, Dexterity save if Range is not empty
     *              Check that only one token is selected and he has the item
     * @public
	 * 
     * @param {*} itemId
     * @param {*} itemName 
	 * 
     * @returns     Launch the save roll window
     */    
     static rollWeaponMacro = async function(itemId, itemName) {
        // Check only one token is selected
        const tokens = canvas.tokens.controlled;
        if (tokens.length > 1) return ui.notifications.warn(game.i18n.localize('MACROS.MultipleTokensSelected'));
        const token = canvas.tokens.controlled[0];

        const actor = token ? token.actor : null;
        if (!actor) return ui.notifications.warn(game.i18n.localize('MACROS.NoTokenSelected'));

        // Check the actor has the item
        let item = actor.items.get(itemId);
        if (!item) return ui.notifications.warn(game.i18n.format('MACROS.ObjectNotInInventory',{itemName:itemName, actorName: actor.data.name }));

        // Open the save window if the item uses resource and is not at 0, or if the item uses no resource
        if (item.data.data.dice === '0') {
            return ui.notifications.warn(game.i18n.format('MACROS.ObjectEmptyResource',{itemName:itemName }));
        }

        let mod = 0;
        if ( game.user.targets.size > 0) {
            const target = [...game.user.targets][0];
            if (target.actor.type=="opponent") {
                mod = target.actor.data.data.malus;
            }
        }
        if (mod < 0) {
            item.data.data.range === "" ? actor.rollSave("str", {modifier: mod}) : actor.rollSave("dex", {modifier: mod}); 
        }
        else {
            item.data.data.range === "" ? actor.rollSave("str") : actor.rollSave("dex"); 
        }
      
	}

    /**
     * @name rollAttackMacro
     * @description Roll the item of type Attack for Opponent
     *              Check that only one token is selected and he has the attack item
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
        let item = actor.items.get(itemId);
        if (!item) return ui.notifications.warn(game.i18n.format('MACROS.AttackNotFound',{opponentName:actor.data.name, itemName: itemName }));

        // Open the roll window
        actor.rollAttackDamageRoll(item);
	}; 
    
    /**
     * @name useAbilityMacro
     * @description Use the ability is there is still uses left
     *              Check that only one token is selected and he has the ability item
     * @public
	 * 
     * @param {*} itemId
     * @param {*} itemName 
	 * 
     * @returns     Launch the item roll window
     */    
     static useAbilityMacro = async function(itemId, itemName) {
        // Check only one token is selected
        const tokens = canvas.tokens.controlled;
        if (tokens.length > 1) return ui.notifications.warn(game.i18n.localize('MACROS.MultipleTokensSelected'));
        const token = canvas.tokens.controlled[0];

        const actor = token ? token.actor : null;
        if (!actor) return ui.notifications.warn(game.i18n.localize('MACROS.NoTokenSelected'));

        // Check the actor has the item
        let item = actor.items.get(itemId);
        if (!item) return ui.notifications.warn(game.i18n.format('MACROS.AbilityNotFound',{characterName:actor.data.name, itemName: itemName}));

        // Use the ability
        if (item.data.data.uses.value === 0){
            ui.notifications.warn(game.i18n.format('MACROS.AbilityUsesAtZero',{itemName: itemName}));
        }
        actor.useAbility(item);
	};    
}
