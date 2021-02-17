
/**
 * Highlight critical success or failure on d20 rolls
 */
export const highlightSuccessFailure = function(message, html, data) {
    if ( !message.isRoll || !message.isContentVisible ) return;
  
    const roll = message.roll;
    if ( !roll.dice.length ) return;
    const d = roll.dice[0];
  
    const options = d.options;
  
    if ( options.target ) {
        if ( roll.total < d.options.target ) html.find(".dice-total").addClass("success");
        else html.find(".dice-total").addClass("failure");
    }
};

