// Namespace Configuration Values
export const CTHACK = {};

// ASCII Artwork
CTHACK.ASCII = `
 #####                                                      #     #                         
#     #  #####  #    #  #    #  #       #    #  #    #      #     #    ##     ####   #    # 
#          #    #    #  #    #  #       #    #  #    #      #     #   #  #   #    #  #   #  
#          #    ######  #    #  #       ######  #    #      #######  #    #  #       ####   
#          #    #    #  #    #  #       #    #  #    #      #     #  ######  #       #  #   
#     #    #    #    #  #    #  #       #    #  #    #      #     #  #    #  #    #  #   #  
 #####     #    #    #   ####   ######  #    #   ####       #     #  #    #   ####   #    # 
`;

/**
 * The set of Ability Scores used within the system
 * @type {Object}
 */
CTHACK.saves = {
	str: 'CTHACK.SaveStr',
	dex: 'CTHACK.SaveDex',
	con: 'CTHACK.SaveCon',
	int: 'CTHACK.SaveInt',
	wis: 'CTHACK.SaveWis',
	cha: 'CTHACK.SaveCha'
};

CTHACK.savesAbbreviation = {
	str: 'CTHACK.SaveStrAbbr',
	dex: 'CTHACK.SaveDexAbbr',
	con: 'CTHACK.SaveConAbbr',
	int: 'CTHACK.SaveIntAbbr',
	wis: 'CTHACK.SaveWisAbbr',
	cha: 'CTHACK.SaveChaAbbr'
};

CTHACK.savesDescription = {
	str: 'CTHACK.SaveStrDesc',
	dex: 'CTHACK.SaveDexDesc',
	con: 'CTHACK.SaveConDesc',
	int: 'CTHACK.SaveIntDesc',
	wis: 'CTHACK.SaveWisDesc',
	cha: 'CTHACK.SaveChaDesc'
};

CTHACK.attributes = {
	flashlights: 'CTHACK.FlashLights',
	smokes: 'CTHACK.Smokes',
	sanity: 'CTHACK.Sanity',
	wealthDice: 'CTHACK.Wealth',
	hitDice: 'CTHACK.Hit',
	miscellaneous: 'CTHACK.Misc',
	armedDamage: 'CTHACK.ArmedDamage',
	unarmedDamage: 'CTHACK.UnarmedDamage'
};

CTHACK.range = {
	near: 'CTHACK.RangeNear',
	far: 'CTHACK.RangeFar',
	distant: 'CTHACK.RangeDistant',
	'3str': 'CTHACK.RangeThreeStr'
};

CTHACK.abilityUsePeriod = {
	Permanent: 'CTHACK.AbilityUsePermanent',
	Scenario: 'CTHACK.AbilityUseScenario',
	Session: 'CTHACK.AbilityUsePerSession',
	Hour: 'CTHACK.AbilityUsePerHour',
	Scene: 'CTHACK.AbilityUsePerScene',
	Fight: 'CTHACK.AbilityUsePerFight'
};

CTHACK.outofaction = {
	'OOA-DEA': 'CTHACK.OutOfAction.Dea',
	'OOA-BRO': 'CTHACK.OutOfAction.Bro',
	'OOA-SAV': 'CTHACK.OutOfAction.Sav',
	'OOA-CRI': 'CTHACK.OutOfAction.Cri',
	'OOA-CRB': 'CTHACK.OutOfAction.Cra',
	'OOA-KNO': 'CTHACK.OutOfAction.Kno',
	'OOA-MIC': 'CTHACK.OutOfAction.Mil',
	'OOA-STA': 'CTHACK.OutOfAction.Sta',
	'OOA-WIN': 'CTHACK.OutOfAction.Win'
};

CTHACK.temporaryInsanity = {
	'TI-AMN': 'CTHACK.TemporaryInsanity.Amn',
	'TI-BLA': 'CTHACK.TemporaryInsanity.Bla',
	'TI-PAA': 'CTHACK.TemporaryInsanity.Paa',
	'TI-HYS': 'CTHACK.TemporaryInsanity.Hys',
	'TI-PAS': 'CTHACK.TemporaryInsanity.Pas',
	'TI-DEL': 'CTHACK.TemporaryInsanity.Del'
};

CTHACK.shock = {
	'SK-SHA': 'CTHACK.Shock.Sha',
	'SK-VAG': 'CTHACK.Shock.Vag',
	'SK-RAB': 'CTHACK.Shock.Rab',
	'SK-FAI': 'CTHACK.Shock.Fai',
	'SK-DIV': 'CTHACK.Shock.Div',
	'SK-SCR': 'CTHACK.Shock.Scr'
};

CTHACK.debug = false;

export const ABILITY_KEYS_RESERVED = [
	'ANIHAN',
	'ADRRUS',
	'BAC',
	'BETALO',
	'DEADEY',
	'IMPDEADEY',
	'DED',
	'ERU',
	'FIEMED',
	'GRIDET',
	'HAR',
	'HEAHIT',
	'IMPHEAHIT',
	'HOUCAR',
	'IND',
	'INF',
	'INH',
	'IROMIN',
	'JACHOL',
	'LEG',
	'LIKROC',
	'LOC',
	'IMPLOC',
	'MAC',
	'MEC',
	'NARESC',
	'PUG',
	'IMPPUG',
	'RIP',
	'ROB',
	'SAV',
	'SCR',
	'IMPSCR',
	'SELPRE',
	'SIZIUP',
	'SLICUS',
	'STA',
	'STEHAN',
	'IMPSTEHAN',
	'SURATT',
	'SWILEA',
	'TACADV',
	'WITWOR'
];

export const DICE_VALUES = [ 0, 4, 6, 8, 10, 12 ];
