import gameHelper from './gameHelper.js'

class MentionHelper {
  static MENTION_REGEX = RegExp(/\[\[(.+):(.+)\]\]/, 'g')
  static INTERNAL_MENTION_REGEX = RegExp(/\[\[(\w)\/(\w+)\/(.+)\]\]/, 'g')

  addMention(conversation, type, name) {
    const text = conversation.text || ''
    const element = conversation.element
    //Do not use and for property access here because a selection start of 0 would be false
    const insertionStart = element ? element.selectionStart : (text.length - 1)
    const insertionEnd = element ? element.selectionEnd : text.length
    
    const mention = `[[${type}:${name}]]`
    const newText = text.substring(0, insertionStart) + mention + text.substring(insertionEnd)
    conversation.text = newText

    if (element) {
      element.setSelectionRange(insertionStart, insertionStart + mention.length)
      element.focus()
    }
  }

  makeMentionsStatic(game, originalText) {
    return originalText.replace(MentionHelper.MENTION_REGEX, (match, typeGroup, nameGroup) => {
      if (typeGroup === 'star') {
        return this.makeStarMentionStatic(game, nameGroup)
      } else if (typeGroup === 'player') {
        return this.makePlayerMentionStatic(game, nameGroup)
      } else {
        return match
      }
    })
  }

  makePlayerMentionStatic(game, playerName) {
    const player = gameHelper.getPlayerByAlias(game, playerName)

    if (player) {
      return this.makeStaticMention('p', player._id, playerName)
    } else {
      return playerName
    }
  }

  makeStarMentionStatic(game, starName) {
    const star = gameHelper.getStarByName(game, starName)

    if (star) {
      return this.makeStaticMention('s', star._id, starName)
    } else {
      return starName
    }
  }

  makeStaticMention(type, id, name) {
    return `[[${type}/${id}/${name}]]`
  }

  replaceMentionsWithNames(message) {
    return message.replace(MentionHelper.INTERNAL_MENTION_REGEX, (_match, _type, _id, name) => name)
  }

  renderMessageWithMentions(element, message, clickHandlers) {
    let lastMentionEnd = 0
    for (const match of message.matchAll(MentionHelper.INTERNAL_MENTION_REGEX)) {
      const text = message.substring(lastMentionEnd, match.index)
      if (text) {
        const node = document.createTextNode(text)
        element.appendChild(node)
      }
      lastMentionEnd = match.index + match[0].length
      const linkElement = this.createMentionLinkElement(match[1], match[2], match[3], clickHandlers)
      element.appendChild(linkElement)
    }

    const lastText = message.substring(lastMentionEnd)
    if (lastText) {
      const node = document.createTextNode(lastText)
      element.appendChild(node)
    }
  }

  createMentionLinkElement(type, id, name, clickHandlers) {
    const node = document.createElement("a")
    node.text = name
    const clickHandlerFactory = clickHandlers[type]
    if (clickHandlerFactory) {
      node.onclick = clickHandlerFactory(id)
    }
    return node
  }
}

export default new MentionHelper()