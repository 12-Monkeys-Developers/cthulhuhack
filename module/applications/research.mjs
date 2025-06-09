import { SYSTEM } from "../config/system.mjs"

export class SearchChat {
  /**
   * Constructor.
   */
  constructor() {
    this.chat = null
    this.searchPattern = null
    this.content = null
    this.template = null
    this.highlighted = false
    this.data = {
      pageResultCollection: [],
      itemResultCollection: [],
      actorResultCollection: [],
    }
    this.template = `systems/${SYSTEM.id}/templates/chat/search-result.hbs`
  }

  /**
   * Creates the chat message.
   * @return this instance.
   */
  async create(searchPattern) {
    this.searchPattern = searchPattern
    this.data.user = game.user.id

    // GM only
    this.data.whisper = ChatMessage.getWhisperRecipients("GM").map((u) => u.id)
    // Create the chat
    return this
  }

  /**
   * Create the message content from the registered template.
   * @returns the message content or null if an error occurs.
   */
  async _createContent() {
    // Update the data to provide to the template
    const data = foundry.utils.duplicate(this.data)

    data.searchPattern = this.searchPattern
    data.highlighted = this.highlighted // Call the template renderer.
    return await foundry.applications.handlebars.renderTemplate(this.template, data)
  }

  /**
   * @description Displays the chat message
   * @returns this instance
   */
  async display() {
    // Create the chat content
    this.content = await this._createContent()

    // Create the chat data
    const chatData = foundry.utils.duplicate(this.data)
    chatData.user = game.user.id
    chatData.content = this.content
    chatData.flags = { world: { type: "searchPage", searchPattern: this.searchPattern, searchData: this.data, highlighted: this.highlighted } }

    this.chat = await ChatMessage.create(chatData)
    return this
  }

  /**
   * @description Search the pattern and update data with the results
   * @returns this instance
   */
  async searchWorld() {
    let pages = []
    game.journal.forEach(async (doc) => {
      let pagesArray = doc.pages.search({ query: this.searchPattern })
      pagesArray.forEach((page) => {
        pages.push({ name: page.name, id: page._id, journalId: doc._id, journalName: doc.name })
      })
    })

    // Group by journal
    const groupedByJournal = pages.reduce((acc, page) => {
      // Create a new group for the journal if it doesn't exist
      acc[page.journalId] = acc[page.journalId] || {
        journalName: page.journalName,
        journalId: page.journalId,
        pages: [],
      }
      // Add the page to the journal's group
      acc[page.journalId].pages.push({ pageId: page.id })
      return acc
    }, {})

    this.data.pageResultCollection = groupedByJournal
    this.data.pageresults = pages.length

    const itemResults = await game.items.search({ query: this.searchPattern })
    this.data.itemResultCollection = itemResults.map((item) => item._id)
    this.data.itemresults = this.data.itemResultCollection.length

    const actorResults = await game.actors.search({ query: this.searchPattern })
    this.data.actorResultCollection = actorResults.map((actor) => actor._id)
    this.data.actorresults = this.data.actorResultCollection.length

    this.data.hasresults = this.data.pageresults + this.data.itemresults + this.data.actorresults
    this.data.tooMuchResults = this.data.hasresults > SYSTEM.SEARCH_MAX_RESULTS
    return
  }

  /**
   * @description Toggle highlighting of pattern in documents
   */
  static async toggleEnricher(event, searchPattern, messageId) {
    event.preventDefault()
    const element = event.currentTarget

    // g for global, multiple replacements, i for case insensitive; the rest is for not replacing the html markup's content when the pattern appears in it
    const regexPattern = await new RegExp("(" + searchPattern + ")(?![^<]*>)", "gim")
    let isAlreadyHighlighted = CONFIG.TextEditor.enrichers.findIndex((element) => element.namePattern === searchPattern)
    if (isAlreadyHighlighted >= 0) {
      // Remove
      CONFIG.TextEditor.enrichers.splice(isAlreadyHighlighted, 1)
    } else {
      // Add
      CONFIG.TextEditor.enrichers = await CONFIG.TextEditor.enrichers.concat([
        {
          pattern: regexPattern,
          namePattern: searchPattern,
          enricher: async (match, options) => {
            const awdoc = document.createElement("mark")
            awdoc.innerHTML = `${match[1]}`
            return awdoc
          },
        },
      ])
    }

    const journals = foundry.applications.instances.values().filter((x) => x.document instanceof JournalEntry)


    for (const journal of journals) {
      foundry.applications.instances.get(journal.id).render(true)
    }

    // Update the chat message
    await SearchChat.updateMessage(messageId)
  }

  // Reset the chat message with no highlighting
  static async updateMessage(messageId, reset = false) {
    const message = game.messages.get(messageId)
    const searchPattern = message.getFlag("world", "searchPattern")
    const searchData = message.getFlag("world", "searchData")
    const highlighted = message.getFlag("world", "highlighted")

    let newChatMessage = await new SearchChat()
    newChatMessage.data = searchData
    newChatMessage.data.searchPattern = searchPattern
    newChatMessage.data.highlighted = reset ? false : !highlighted

    const newContent = await foundry.applications.handlebars.renderTemplate(newChatMessage.template, newChatMessage.data)
    message.update({ content: newContent, "flags.world.highlighted": reset ? false : !highlighted })
  }
}

/**
 * Prompt the user to perform a search.
 * @extends {Dialog}
 */
export class SearchDialog extends Dialog {

  static _warnedAppV1 = true

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 400,
      height: 270,
      classes: ["cthack", "dialog", "search"],
      template: `systems/${SYSTEM.id}/templates/search/search-dialog.hbs`,
    })
  }
  data = {
    title: game.i18n.localize("SEARCHTOOL.WindowTitle"),
    buttons: {
      research: {
        label: game.i18n.localize("SEARCHTOOL.ButtonSearch"),
        callback: async (html) => {
          let searchPattern = html.find("[name=searchtext]")[0].value
          if (searchPattern) {
            let search = await new SearchChat().create(searchPattern)
            await search.searchWorld()
            await search.display()
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
    default: "research",
    close: () => {},
  }
}
