class MentionHelper {
  addMention(conversation, type, name) {
    const text = conversation.text || '';
    const insertionStart = (conversation.selection && conversation.selection.from) || text.length - 1
    const insertionEnd = (conversation.selection && conversation.selection.end) || text.length
    
    const mention = `[[${type}:${name}]]`
    const newText = text.substring(0, insertionStart) + mention + text.substring(insertionEnd)
    conversation.text = newText;

    if (conversation.selection && conversation.selection.element) {
      conversation.selection.element.setSelectionRange(insertionEnd, insertionEnd)
    }
  }
}

export default new MentionHelper()