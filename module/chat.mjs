
/**
 * Highlight critical success or failure on d20 rolls
 */
export const highlightSuccessFailure = function(message, html, data) {
    if ( !message.isRoll || !message.isContentVisible ) return;
  
    const roll = message.rolls[0];
    if ( !roll.dice.length ) return;
    const d = roll.dice[0];
  
    const options = d.options;
  
    if ( options.target ) {
        if ( roll.total < d.options.target + (d.options.modifier !== undefined ? parseFloat(d.options.modifier) : 0)) html.find(".dice-total").addClass("roll-success");
        else html.find(".dice-total").addClass("roll-failure");
    }

    if ( options.rollType === "Resource" || options.rollType === "Material") {
        if (roll.total === 1 || roll.total === 2) {
            html.find(".dice-total").addClass("roll-failure");
        }
    }
    
};

