/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CtHackActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cthack", "sheet", "actor"],
      template: "systems/cthack/templates/actor/actor-sheet.hbs",
      width: 820,
      height: 680,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "abilities" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
    /*for (let attr of Object.values(data.data.attributes)) {
      attr.isCheckbox = attr.dtype === "Boolean";
    }
    */
    return data;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory or Ability Item
    html.find('.item-create').click(this._onItemCreate.bind(this));
    html.find('.ability-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Update Ability Item
    html.find('.ability-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Delete Ability Item
    html.find('.ability-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Saving throws
    html.find('.save-name').click(this._onSaveRoll.bind(this));

    // Resource roll
    html.find('.resource-name').click(this._onResourceRoll.bind(this));

    // Armed and unarmed damage rolls
    html.find('.armed-damage-name').click(this._onDamagedRoll.bind(this));
    html.find('.unarmed-damage-name').click(this._onDamagedRoll.bind(this));

  }

  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.data.data);
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

  /**
   * Handle clickable save roll
   * @param {Event} event   The originating click event
   * @private
   */
  _onSaveRoll(event) {
    event.preventDefault();
    let save = event.currentTarget.parentElement.dataset.save;
    this.actor.rollSave(save, {event: event});
  }

  /**
   * Handle clickable resource roll
   * @param {Event} event   The originating click event
   * @private
   */
  async _onResourceRoll(event) {
    event.preventDefault();
    let resource = event.currentTarget.dataset.resource;

    let rollResource = await this.actor.rollResource(resource, {event: event});
    
    // Resource loss
    if (resource && (rollResource.results[0] === 1 || rollResource.results[0] === 2)) {
      await this.actor.decreaseResource(resource);      
      this.actor.sheet.render(true);
    }    
  }

  /**
   * Handle clickable Damaged roll.
   * @param {Event} event   The originating click event
   * @private
   */
  _onDamagedRoll(event) {
    event.preventDefault();
    let damage = event.currentTarget.dataset.resource;
    this.actor.rollDamageRoll(damage, {event: event});
  }

  /** @override */
  _onDrop(event) {
    event.preventDefault();
    if (!this.options.editable) return false;
    // Get dropped data
    let data;
    try {
        data = JSON.parse(event.dataTransfer.getData('text/plain'));
    } catch (err) {
        return false;
    }
    if (!data) return false;

    // Dropped Item
    if (data.type === "Item") {
        return this._onDropItem(event, data);
    }
  }

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @return {Object}             OwnedItem data to create
   * @private
   */
  async _onDropItem(event, data) {
    const item = await Item.fromDropData(data);
    const itemData = duplicate(item.data);
    switch (itemData.type) {
        case "archetype"    :
            return await this._onDropArchetypeItem(event, itemData);
        case "ability"    :
            return await this._onDropAbilityItem(event, itemData);
        default:
            return;
    }
  }

   /**
   * Handle dropping of an archetype onto an Actor Sheet
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @private
   */
  async _onDropArchetypeItem(event, itemData) {
    event.preventDefault();
    // Replace actor data
    this.actor.update({
      'data.archetype': itemData.name,
      'data.attributes.flashlights': {"value": itemData.data.flashlights, "max": itemData.data.flashlights},
      'data.attributes.smokes': {"value": itemData.data.smokes, "max": itemData.data.smokes}, 
      'data.attributes.sanity': {"value": itemData.data.sanity, "max": itemData.data.sanity}, 
      'data.attributes.hitDice': {"value": itemData.data.hitdice},
      'data.attributes.hitPoints': {"value": itemData.data.hitdice},
      'data.attributes.wealthDice': {"value": itemData.data.wealthDice},
      'data.attributes.armedDamage': {"value": itemData.data.armeddamage},
      'data.attributes.unarmedDamage': {"value": itemData.data.unarmeddamage},
    });
    this.actor.sheet.render(true);
  }

     /**
   * Handle dropping of an ability onto an Actor Sheet
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @private
   */
  _onDropAbilityItem(event, itemData) {
    event.preventDefault();
    const id = itemData._id;
    if(this.actor.data.data.abilities && !this.actor.data.data.abilities.includes(id)){
        let abilities = this.actor.data.data.abilities;
        abilities.push(id);
        return this.actor.update(abilities);
    }
    else ui.notifications.error("Cette capacité spéciale est déjà présente.")
  }

}
