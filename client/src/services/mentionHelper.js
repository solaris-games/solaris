class MentionHelper {
  addMention(conversation, type, name) {
    const text = conversation.text || '';
    const element = conversation.element
    //Do not use and for property access here because a selection start of 0 would be false
    const insertionStart = element ? element.selectionStart : (text.length - 1)
    const insertionEnd = element ? element.selectionEnd : text.length
    
    const mention = `[[${type}:${name}]]`
    const newText = text.substring(0, insertionStart) + mention + text.substring(insertionEnd)
    conversation.text = newText;

    if (element) {
      element.setSelectionRange(insertionStart, insertionStart + mention.length)
      element.focus()
    }
  }
}

export default new MentionHelper()