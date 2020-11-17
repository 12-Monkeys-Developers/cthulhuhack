/**
 * A standardized helper function for managing Cthulhu Hack dice rolls
 *
 * @param {String} diceType         The type of dice : d20, d12, d10, d8, d6, d4
 * @param {Array} parts             The dice roll component parts, excluding the initial dice
 * @param {Object} data             Actor or item data against which to parse the roll
 * @param {Event|object} event      The triggering event which initiated the roll
 * @param {string} rollMode         A specific roll mode to apply as the default for the resulting roll
 * @param {string|null} template    The HTML template used to render the roll dialog
 * @param {string|null} title       The dice roll UI window title
 * @param {Object} speaker          The ChatMessage speaker to pass when creating the chat
 * @param {string|null} flavor      Flavor text to use in the posted chat message
 * @param {Function} onClose        Callback for actions to take when the dialog form is closed
 * @param {Object} dialogOptions    Modal dialog options
 * @param {boolean} advantage       Apply advantage to the roll (unless otherwise specified)
 * @param {boolean} disadvantage    Apply disadvantage to the roll (unless otherwise specified)
 * @param {boolean} resourceRoll    Specify if it's a resource roll
 * @param {number} targetValue      Assign a target value against which the result of this roll should be compared
 * @param {boolean} chatMessage     Automatically create a Chat Message for the result of this roll
 * @param {object} messageData      Additional data which is applied to the created Chat Message, if any
 *
 * @return {Promise}                A Promise which resolves once the roll workflow has completed
 */
export async function diceRoll({diceType="d20", parts=[], data={}, event={}, rollMode=null, template=null, title=null, speaker=null,
    flavor=null, dialogOptions,
    advantage=null, disadvantage=null, resourceRoll=false, targetValue=null,
    chatMessage=true, messageData={}}={}) {
  
   // Prepare Message Data
   messageData.flavor = flavor || title;
   messageData.speaker = speaker || ChatMessage.getSpeaker();
   const messageOptions = {rollMode: rollMode || game.settings.get("core", "rollMode")};

   let adv = 0;

   if (advantage){
       adv = 1;
   }
   else if (disadvantage){
       adv = -1;
   }

   // Define the inner roll function
   const _roll = (parts, adv) => {
  
     // Determine the dice roll and modifiers
     let nd = 1;
     let mods = "";
  
     // Handle advantage
     if (adv === 1) {
      nd = 2; 
      messageData.flavor += ` (${game.i18n.localize("CTHACK.Advantage")})`;
      mods += "kh";
     }
     // Handle disadvantage
     else if (adv === -1) {
       nd = 2;
       messageData.flavor += ` (${game.i18n.localize("CTHACK.Disadvantage")})`;
       mods += "kl";
     }
  
     // Prepend the dice roll
     let formula = `${nd}${diceType}${mods}`;
     parts.unshift(formula);
  
     // Execute the roll
     let roll = new Roll(parts.join(" + "), data);
     try {
       roll.roll();
     } catch (err) {
       console.error(err);
       ui.notifications.error(`Dice roll evaluation failed: ${err.message}`);
       return null;
     }
  
     return roll;
    }
  
   // Create the Roll instance
   const roll = await _diceRollDialog({template, title, parts, data, rollMode: messageOptions.rollMode, dialogOptions, roll: _roll});
  
   // Create a Chat Message
   if ( roll && chatMessage ) {
     // Save roll
     if (!resourceRoll && targetValue) {
      if (roll.total < targetValue){
        messageData.flavor += ` (${game.i18n.localize("CTHACK.RollSuccess")})`;
      }
      else {
        messageData.flavor += ` (${game.i18n.localize("CTHACK.RollFailure")})`;
      }
     }
     // Resource roll
     else if (resourceRoll){
      if (roll.total == 1 || roll.total == 2){
        messageData.flavor += ` (${game.i18n.localize("CTHACK.ResourceRollFailure")})`;
      } 
     }
    roll.toMessage(messageData, messageOptions);
   }

   return roll;
}

/**
 * Present a Dialog form which creates a d20 roll once submitted
 * @return {Promise<Roll>}
 * @private
 */
async function _diceRollDialog({template, title, parts, data, rollMode, dialogOptions, roll}={}) {

    // Render modal dialog
    template = template || "systems/cthack/templates/chat/roll-dialog.html";
    let dialogData = {
      formula: parts.join(" + "),
      data: data,
      rollMode: rollMode,
      rollModes: CONFIG.Dice.rollModes
    };
    const html = await renderTemplate(template, dialogData);
  
    // Create the Dialog window
    return new Promise(resolve => {
      new Dialog({
        title: title,
        content: html,
        buttons: {
          advantage: {
            label: game.i18n.localize("CTHACK.Advantage"),
            callback: html => resolve(roll(parts, 1))
          },
          normal: {
            label: game.i18n.localize("CTHACK.Normal"),
            callback: html => resolve(roll(parts, 0))
          },
          disadvantage: {
            label: game.i18n.localize("CTHACK.Disadvantage"),
            callback: html => resolve(roll(parts, -1))
          }
        },
        default: "normal",
        close: () => resolve(null)
      }, dialogOptions).render(true);
    });
}



