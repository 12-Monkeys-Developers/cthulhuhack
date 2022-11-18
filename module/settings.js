import { refreshAllActorSheets } from './utils.js';

export const registerSystemSettings = function() {
	/**
     * Display FRench Compendium
     */
	 game.settings.register('cthack', 'CommpendiumFR', {
		name: 'SETTINGS.CompendiumFRName',
		hint: 'SETTINGS.CompendiumFRHint',
		scope: 'world',
		config: true,
		type: Boolean,
		default: true,
		requiresReload: true
	});

	/**
     * Display ENglish Compendium
     */
	 game.settings.register('cthack', 'CommpendiumEN', {
		name: 'SETTINGS.CompendiumENName',
		hint: 'SETTINGS.CompendiumENHint',
		scope: 'world',
		config: true,
		type: Boolean,
		default: true,
		requiresReload: true
	});

	/**
     * Fortune option
     */
	game.settings.register('cthack', 'FortuneAvailable', {
		name: 'SETTINGS.FortuneAvailableName',
		hint: 'SETTINGS.FortuneAvailableHint',
		scope: 'world',
		config: true,
		type: Boolean,
		default: false,
		onChange: () => refreshAllActorSheets()
	});

	/**
     * Track the fortune value
     */
	game.settings.register('cthack', 'FortuneValue', {
		name: 'SETTINGS.FortuneValueName',
		hint: 'SETTINGS.FortuneValueHint',
		scope: 'world',
		config: true,
		type: Number,
		default: 0,
		onChange: () => refreshAllActorSheets()
	});

	/**
     * Adrenaline option
     */
	game.settings.register('cthack', 'Adrenaline', {
		name: 'SETTINGS.AdrenalineName',
		hint: 'SETTINGS.AdrenalineHint',
		scope: 'world',
		config: true,
		type: Boolean,
		default: false,
		onChange: () => refreshAllActorSheets()
	});

	/**
     * HitDice as resource option
     */
	game.settings.register('cthack', 'HitDiceResource', {
		name: 'SETTINGS.HitDiceResourceName',
		hint: 'SETTINGS.HitDiceResourceHint',
		scope: 'world',
		config: true,
		type: Boolean,
		default: false,
		onChange: () => refreshAllActorSheets()
	});

	/**
     * Wealth as resource option
     */
	game.settings.register('cthack', 'Wealth', {
		name: 'SETTINGS.WealthName',
		hint: 'SETTINGS.WealthHint',
		scope: 'world',
		config: true,
		type: String,
		choices: {
            "none" : "SETTINGS.WealthNone",
            "fixed" : "SETTINGS.WealthFixedValue",
            "resource" : "SETTINGS.WealthResource"
        },
		default: "fixed",
		onChange: () => refreshAllActorSheets()
	});

	/**
     * Option to replace Wealth by another resource
     */
	game.settings.register('cthack', 'MiscellaneousResource', {
		name: 'SETTINGS.MiscellaneousResourceName',
		hint: 'SETTINGS.MiscellaneousResourceHint',
		scope: 'world',
		config: true,
		type: String,
		default: "",
		onChange: () => refreshAllActorSheets()
	});
	
};
