const { HandlebarsApplicationMixin } = foundry.applications.api
const { AbstractSidebarTab } = foundry.applications.sidebar
import { SearchDialog } from "../applications/research.mjs"

export default class CtHackSidebarMenu extends HandlebarsApplicationMixin(AbstractSidebarTab) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    window: {
      title: "CTHACK.Sidebar.title",
    },
    actions: {
      openApp: CtHackSidebarMenu.#onOpenApp,
    },
  }

  /** @override */
  static tabName = "cthack"

  /** @override */
  static PARTS = {
    cthack: {
      template: "systems/cthack/templates/sidebar-menu.hbs",
      root: true, // Permet d'avoir plusieurs sections dans le hbs
    },
  }

  static async #onOpenApp(event) {
    switch (event.target.dataset.app) {
      case "gmmanager":
        if (!foundry.applications.instances.has("cthack-application-manager")) game.system.applicationManager.render({ force: true })
        break
      case "search":
        await new SearchDialog().render(true)
        break
    }
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options)
    return Object.assign(context, {
      version: "Version " + game.system.version,
    })
  }
}
