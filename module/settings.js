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
		default: false
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
		default: 0
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
		default: false
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
		default: false
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
		default: false
	});
	
};
