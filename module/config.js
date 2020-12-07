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
  "str": "CTHACK.SaveStr",
  "dex": "CTHACK.SaveDex",
  "con": "CTHACK.SaveCon",
  "int": "CTHACK.SaveInt",
  "wis": "CTHACK.SaveWis",
  "cha": "CTHACK.SaveCha"
};

CTHACK.savesAbbreviation = {
  "str": "CTHACK.SaveStrAbbr",
  "dex": "CTHACK.SaveDexAbbr",
  "con": "CTHACK.SaveConAbbr",
  "int": "CTHACK.SaveIntAbbr",
  "wis": "CTHACK.SaveWisAbbr",
  "cha": "CTHACK.SaveChaAbbr"
};

CTHACK.savesDescription = {
  "str": "CTHACK.SaveStrDesc",
  "dex": "CTHACK.SaveDexDesc",
  "con": "CTHACK.SaveConDesc",
  "int": "CTHACK.SaveIntDesc",
  "wis": "CTHACK.SaveWisDesc",
  "cha": "CTHACK.SaveChaDesc"
};

CTHACK.resources = {
  "fla": "CTHACK.FlashLights",
  "smo": "CTHACK.Smokes",
  "san": "CTHACK.Sanity"
};

CTHACK.resourcesTemplate = {
  "fla": "flashlights",
  "smo": "smokes",
  "san": "sanity"
};

CTHACK.attributes = {
  "armedDamage": "CTHACK.ArmedDamage",
  "unarmedDamage": "CTHACK.UnarmedDamage"
};

CTHACK.range = {
  "near": "CTHACK.RangeNear",
  "far": "CTHACK.RangeFar",
  "distant": "CTHACK.RangeDistant",
  "3str": "CTHACK.Range3Str"
};

CTHACK.abilityUsePeriod = {
  "Permanent": "CTHACK.AbilityUsePermanent",
  "Session": "CTHACK.AbilityUsePerSession",
  "Hour": "CTHACK.AbilityUsePerHour",
  "Fight": "CTHACK.AbilityUsePerFight"
};

export const ABILITY_KEYS_RESERVED = ["SWILEA","STA","SURATT","HOUCAR","LIKROC","DED","ANIHAN","IND","MEC","IROMIN","RIP","LEG","SELPRE","HAR","SAV","STEHAN"];

export const DICE_VALUES = [0,4,6,8,10,12];