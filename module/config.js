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
CTHACK.abilities = {
  "str": "CTHACK.AbilityStr",
  "dex": "CTHACK.AbilityDex",
  "con": "CTHACK.AbilityCon",
  "int": "CTHACK.AbilityInt",
  "wis": "CTHACK.AbilityWis",
  "cha": "CTHACK.AbilityCha"
};

CTHACK.abilityAbbreviations = {
  "str": "CTHACK.AbilityStrAbbr",
  "dex": "CTHACK.AbilityDexAbbr",
  "con": "CTHACK.AbilityConAbbr",
  "int": "CTHACK.AbilityIntAbbr",
  "wis": "CTHACK.AbilityWisAbbr",
  "cha": "CTHACK.AbilityChaAbbr"
};

CTHACK.abilityDescription = {
  "str": "CTHACK.AbilityStrDesc",
  "dex": "CTHACK.AbilityDexDesc",
  "con": "CTHACK.AbilityConDesc",
  "int": "CTHACK.AbilityIntDesc",
  "wis": "CTHACK.AbilityWisDesc",
  "cha": "CTHACK.AbilityChaDesc"
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

export const DICE_VALUES = [0,4,6,8,10,12];