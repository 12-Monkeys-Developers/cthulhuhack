const GM_MANAGER = "gm-manager";
const GM_MANAGER_POSITION = "gm-manager-position";
const GM_MANAGER_INITIAL_POSITION = { top: 200, left: 200 };
const GM_MANAGER_TEMPLATE = 'systems/cthack/templates/app/gm-manager.hbs';

export class GMManager extends Application {

    constructor() {
        super();
        this.handleDrag = new HandleDragApplication(
            doc => doc.getElementById("gm-manager"),
            {
              initial: GM_MANAGER_INITIAL_POSITION,
              maxPos: { left: 200, top: 100 },
              settings: {
                system: SYSTEM_NAME,
                keyPosition: GM_MANAGER_POSITION
              }
            }
        )
        Hooks.once('ready', () => this.onReady());
      }

    onReady() {
        if (game.user.isGM) {
            game.cthack.gmManager.render(true);
        }
    }

    static get defaultOptions() {
        let options = {};
        options.id = GM_MANAGER;
        //options.title = game.i18n.localize(ANARCHY.gmManager.title);
        options.title = " GM Manager"
        options.template = GM_MANAGER_TEMPLATE;
        options.popOut = false;
        options.resizable = false;
        options.height = "200px";
        options.width = "200px";
        return options;
    }    

}