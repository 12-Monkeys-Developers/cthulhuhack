import { isDice } from "./utils.js"

export const registerHandlebarsHelpers = function (){

 Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper('toAbbr', function(str) {
    var outStr = 'CTHACK.Ability' + str.substring(0,1).toUpperCase() + str.substring(1) + 'Abbr';
    return outStr;
  });

  Handlebars.registerHelper('toDesc', function(str) {
    var outStr = 'CTHACK.Ability' + str.substring(0,1).toUpperCase() + str.substring(1) + 'Desc';
    return outStr;
  });

  // Return the dice from a value
  Handlebars.registerHelper('toDice', function(value) {
    if (isDice(value)){
      var outStr = `1d{{value}}`;
      return outStr;
    }
    console.log(`{{value}} is not a valid dice value`);
  });

}