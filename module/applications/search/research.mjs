import { SYSTEM } from "../../config/system.mjs";

export class SearchChat {
  /**
   * Constructor.
   */
  constructor() {
    this.chat = null;
    this.searchPattern = null;
    this.content = null;
    this.template = null;
    this.data = {
      pageResultCollection: [],
      itemResultCollection: [],
      actorResultCollection: [],
    };
    this.template = `systems/${SYSTEM.id}/templates/chat/search-result.hbs`;
  }

  /**
   * Creates the chat message.
   * @return this instance.
   */
  async create(searchPattern) {
    this.searchPattern = searchPattern;
    this.data.user = game.user.id;

    //GM only
    this.data.whisper = ChatMessage.getWhisperRecipients("GM").map((u) => u.id);
    // Create the chat
    return this;
  }

  /**
   * Create the message content from the registered template.
   * @returns the message content or null if an error occurs.
   */
  async _createContent() {
    // Update the data to provide to the template
    const data = duplicate(this.data);

    data.searchPattern = this.searchPattern;
    // Call the template renderer.
    return await renderTemplate(this.template, data);
  }

  /**
   * @description Displays the chat message
   * @returns this instance
   */
  async display() {
    // Create the chat content
    this.content = await this._createContent();

    // Create the chat data
    const chatData = duplicate(this.data);
    chatData.user = game.user.id;
    chatData.content = this.content;
    chatData.flags = { world: { type: "searchPage", searchPattern: this.searchPattern } };

    this.chat = await ChatMessage.create(chatData);
    return this;
  }

  /**
   * @description Search the pattern
   * @returns this instance
   */
  async searchWorld() {
    game.journal.forEach(async (doc) => {
      let pagesArray = doc.pages.search({ query: this.searchPattern });
      pagesArray.forEach((page) => {
        this.data.pageResultCollection.push({ name: page.name, id: page._id, journalId: doc._id, journalName: doc.name });
      });
    });
    this.data.pageresults = this.data.pageResultCollection.length;
    this.data.itemResultCollection = await game.items.search({ query: this.searchPattern });
    this.data.itemresults = this.data.itemResultCollection.length;
    this.data.actorResultCollection = await game.actors.search({ query: this.searchPattern });
    this.data.actorresults = this.data.actorResultCollection.length;
    this.data.hasresults = this.data.pageresults + this.data.itemresults + this.data.actorresults;
    this.data.tooMuchResults = (this.data.hasresults > 20);
    return;
  }

  /**
   * @description Display the journal page with hilighted pattern
   */
  static async onOpenJournalPage(event, searchPattern) {
    event.preventDefault();
    const element = event.currentTarget;

    const journalId = element.dataset.journalId;
    const journal = game.journal.get(journalId);
    const pageId = element.dataset.pageId;
    const journalPage = await journal.pages.get(pageId);
    if (!journalPage || !searchPattern) return;

    //cas image
    if (journalPage.type === "image") {
      const imgPopout = new ImagePopout(journalPage.src);
      imgPopout.render(true);
      return;
    }
    //cas texte
    let originalText = journalPage.text.content;
    const regexPattern = new RegExp("("+searchPattern+")(?![^<]*>)", "gi"); //g pour global, remplacement multiples, i pour case insensitive ; le reste est pour ne pas remplacer le contenu des balises quand le pattern y apparait
    const modifiedText = await originalText.replace(regexPattern, "<mark>$1</mark>");

    const modifiedTexthtml = await TextEditor.enrichHTML(modifiedText, { async: false });

    let highlightedPage = new Dialog({
      content: modifiedTexthtml,
      submitOnChange: false,
      resizable: true,
      buttons: {
        Cancel: { label: `Fermer` },
      },
    });

    highlightedPage.position.width = 800;
    highlightedPage.render(true);
  }
}

/**
 * Prompt the user to perform a search.
 * @extends {Dialog}
 */
export class SearchDialog extends Dialog {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 400,
      height: 230,
      classes: ["cthack", "dialog", "search"],
      template: `systems/${SYSTEM.id}/templates/search/search-dialog.hbs`,
    });
  }
  data = {
    title: game.i18n.localize("SEARCHTOOL.WindowTitle"),
    buttons: {
      chercher: {
        label: game.i18n.localize("SEARCHTOOL.ButtonSearch"),
        callback: async (html) => {
          let searchPattern = html.find("[name=searchtext]")[0].value;
          if (searchPattern) {
            let search = await new SearchChat().create(searchPattern);
            await search.searchWorld();
            await search.display();
          }
        },
        icon: `<i class="fas fa-magnifying-glass"></i>`,
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("SEARCHTOOL.ButtonCancel"),
        callback: () => {},
      },
    },
    default: "chercher",
    close: () => {},
  };
}
