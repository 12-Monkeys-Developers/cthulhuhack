const GM_MANAGER = "gm-manager";
const GM_MANAGER_TEMPLATE = 'systems/cthack/templates/app/gm-manager.hbs';
export class GMManager extends Application {

    constructor() {
        super({id: GM_MANAGER});
        Hooks.on('updateSetting', async (setting, update, options, id) => this.updateManager(setting, update, options, id));
        Hooks.on('updateActor', async (setting, update, options, id) => this.updateManager(setting, update, options, id));
        Hooks.on('renderPlayerList', async (setting, update, options, id) => this.updateManager(setting, update, options, id));                
        Hooks.once('ready', () => this.onReady());
      }

    async updateManager(setting, update, options, id) {
      game.cthack.gmManager.render(false);
    }

    onReady() {
        if (game.user.isGM) {
          game.cthack.gmManager.render(true);
        }
    }

    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        template: GM_MANAGER_TEMPLATE,
        title:  game.i18n.localize('GMMANAGER.Title'),
        top: 100,
        left: 120,
        width: game.settings.get('cthack', 'Adrenaline') ? 600 : 500,
        height: "auto",
        resizable: true,
      });
    }

    getData() {
      const data = super.getData();
      data.players = game.users.filter(u=>u.hasPlayerOwner && u.active);     
      return data;      
    }

    render(force=false, options={}){
      if (game.user.isGM) {
        return super.render(force, options);
      }      
    }

}