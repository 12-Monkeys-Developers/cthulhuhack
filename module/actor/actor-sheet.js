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
      height: 720,
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

    // Delete Inventory or Ability Item
    html.find('.item-delete').click(this._onItemDelete.bind(this));
    html.find('.ability-delete').click(this._onItemDelete.bind(this));

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
    return this.actor.createOwnedItem(itemData,{renderSheet: true});
  } 

  /**
   * Callback on delete item actions
   * @param event the roll event
   * @private
   */
  _onItemDelete(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item");
    const itemId = li.data("itemId");
    const entity = this.actor.items.find(item => item._id === itemId);
    const key = entity.data.data.key;
    li.slideUp(200, () => this.render(false));
    //return this.actor.deleteOwnedItem(itemId);
    switch (entity.data.type) {
      case "item" :
            return this.actor.deleteOwnedItem(itemId);
      case "ability" :
            this.actor.deleteAbility(key, itemId);
            return this.actor.deleteOwnedItem(itemId);
      default: 
            return this.actor.deleteOwnedItem(itemId);
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

  /**
   * Handle the final creation of dropped Item data on the Actor.
   * This method is factored out to allow downstream classes the opportunity to override item creation behavior.
   * @param {object} itemData     The item data requested for creation
   * @return {Promise<Actor>}
   * @private  
   **/ 
  async _onDropItemCreate(itemData) {
    switch (itemData.type) {
      case "archetype"    :
          return await this._onDropArchetypeItem(itemData);
      case "ability"    :
          return await this._onDropAbilityItem(itemData);
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
  _onDropArchetypeItem(itemData) {
    // Replace actor data
    this.actor.update({
      'data.archetype': itemData.name,
      'data.attributes.flashlights': {"value": itemData.data.flashlights, "max": itemData.data.flashlights},
      'data.attributes.smokes': {"value": itemData.data.smokes, "max": itemData.data.smokes}, 
      'data.attributes.sanity': {"value": itemData.data.sanity, "max": itemData.data.sanity}, 
      'data.attributes.hitDice': {"value": itemData.data.hitdice},
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
  _onDropAbilityItem(itemData) {
    const id = itemData._id;
    const key = itemData.data.key;
    const multiple = itemData.data.multiple;

    let abilitiesList = this.actor.data.data.abilities;
    if (multiple || !this._hasAbility(key,abilitiesList)){
      abilitiesList.push({"key": key, "id": id});
      this.actor.update({'data.abilities': abilitiesList});
      return this.actor.createEmbeddedEntity("OwnedItem", itemData,{renderSheet: true});
    }
    return;
  }

 /**
   * Check if the ability is already owned based on key
   * @param {String} key      The key to find
   * @param {String[]} abilitiesList   All owned abilities
   * @private
   */
  _hasAbility(key,abilitiesList){
    for (let ability of abilitiesList){
      if (key === ability.key){
        return true;
      }
    }
    return false;
  }

}
