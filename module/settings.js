import { refreshAllActorSheets } from './utils.js';

export const registerSystemSettings = function() {
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
	game.settings.register('cthack', 'WealthResource', {
		name: 'SETTINGS.WealthResourceName',
		hint: 'SETTINGS.WealthResourceHint',
		scope: 'world',
		config: true,
		type: Boolean,
		default: false,
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
