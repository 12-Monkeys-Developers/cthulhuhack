import { DICE_VALUES} from "./config.js"

export function isDice(value){
    return DICE_VALUES.includes(value);
  }

// Return the next lower type of dice : d4 for d6 by exemple
export function findLowerDice(dice){
    console.log(`Find lower dice of ${dice}`);
    let result = "0";
    if (dice !== "0"){
        let value = parseInt(dice.substring(1));
        let index = DICE_VALUES.indexOf(value);
        let newValue = DICE_VALUES[index-1];
        if (newValue !== 0){
            result = "d" + newValue;
        }        
    }
    console.log(`Lower dice is ${result}`);
    return result;
}