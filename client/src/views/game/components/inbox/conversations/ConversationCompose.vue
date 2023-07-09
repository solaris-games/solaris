<template>
<form class="pb-1 conversation">
    <div class="mention-overlay bg-dark mb-1" v-if="suggestMentions && currentMention && currentMention.suggestions && currentMention.suggestions.length">
      <ul>
        <li v-for="(suggestion, index) in currentMention.suggestions" :class="{ selected: index === selectedSuggestion }" :key="suggestion" @click="() => useSuggestion(suggestion)">{{suggestion}}</li>
      </ul>
    </div>
    <div class="mb-2 mb-2">
        <textarea class="form-control" id="txtMessage" rows="3" :placeholder="placeholderText" ref="messageElement" :value="this.$store.state.currentConversation.text" @input="onMessageChange" @keydown="onKeyDown" @keyup="updateSuggestions" @select="updateSuggestions" @focus="updateSuggestions"></textarea>
    </div>
    <div class="mb-2 text-end">
      <div class="d-grid gap-2">
        <button type="button" class="btn btn-success" @click="send" :disabled="isSendingMessage">
          <i class="fas fa-paper-plane"></i>
          Send Message
        </button>
      </div>
    </div>
</form>
</template>

<script>
import MentionHelper from '../../../../../services/mentionHelper';
import ConversationApiService from '../../../../../services/api/conversation'
import AudioService from '../../../../../game/audio'

export default {
  components: {

  },
  props: {
    conversationId: String,
  },
  data () {
    return {
      isSendingMessage: false,
      focused: false,
      suggestMentions: false,
      currentMention: null,
      selectedSuggestion: null
    }
  },
  mounted () {
    this.$store.commit('setMentionReceivingElement', this.$refs.messageElement)
    this.suggestMentions = this.$store.state.settings.interface.suggestMentions === 'enabled'
  },
  methods: {
    useSuggestion (suggestion) {
      if (this.suggestMentions && this.currentMention) {
        this.selectedSuggestion = null

        this.$store.commit('replaceInConversationText', {
          mention: this.currentMention.mention,
          text: suggestion
        })
      }
    },
    setSelectedSuggestion (newSelected) {
      const suggestions = this.currentMention.suggestions.length
      //Modulo instead of remainder so instead of -1 we get the last suggestion
      this.selectedSuggestion = ((newSelected % suggestions) + suggestions) % suggestions
    },
    async onKeyDown (e) {
      const isEnterTabKey = e.key === 'Enter' || e.key === 'Tab'

      if (isEnterTabKey && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        await this.send()
      } else if (this.suggestMentions && this.currentMention) {
        if (isEnterTabKey && this.selectedSuggestion !== null && this.selectedSuggestion !== undefined) {
          e.preventDefault()
          this.useSuggestion(this.currentMention.suggestions[this.selectedSuggestion])
        } else if (e.key === 'ArrowDown' || e.key === 'Tab') {
          e.preventDefault()
          this.setSelectedSuggestion(this.selectedSuggestion + 1)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          this.setSelectedSuggestion(this.selectedSuggestion - 1)
        }
      }
    },
    updateSuggestions () {
      if (this.suggestMentions) {
        const oldMention = this.currentMention

        this.currentMention = MentionHelper.getCurrentMention(this.$store.state.game, this.$refs.messageElement)
        const newSuggestions = this.currentMention && this.currentMention.suggestions && this.currentMention.suggestions.length

        if (oldMention && !this.currentMention) {
          this.selectedSuggestion = null //Mention was left
        } else if ((!oldMention || !oldMention.suggestions || !oldMention.suggestions.length) && newSuggestions) {
          this.selectedSuggestion = 0 //Mention was started
        }

        if (this.currentMention && this.selectedSuggestion != null) {
          //When the number of new suggestions is smaller, the selection might not get displayed otherwise
          this.setSelectedSuggestion(this.selectedSuggestion)
        }
      }
    },
    onMessageChange (e) {
      this.$store.commit('updateCurrentConversationText', e.target.value)
    },
    async send () {
      let messageText = ''

      if (this.$store.state.currentConversation) {
        messageText = this.$store.state.currentConversation.text

        if (!messageText) {
          return
        }
      }

      const message = MentionHelper.makeMentionsStatic(this.$store.state.game, messageText)

      try {
        this.isSendingMessage = true

        let response = await ConversationApiService.send(this.$store.state.game._id, this.conversationId, message)

        if (response.status === 200) {
          AudioService.type()

          this.$emit('onConversationMessageSent', response.data)

          this.$store.commit('resetCurrentConversationText')
          this.currentMention = null
        }
      } catch (e) {
        console.error(e)
      }

      this.isSendingMessage = false
    }
  },
  computed: {
    placeholderText: function () {
      return !this.suggestMentions ? 'Compose a message...' : 'Compose a message. Use @ for players and # for stars.'
    }
  }
}
</script>

<style scoped>
.conversation {
  position: relative;
}

.mention-overlay {
  position: absolute;
  z-index: 10;
  bottom: 100%;
  width: 100%;
  border-radius: 4px;
}

.mention-overlay ul {
  padding: 4px 8px;
  margin-bottom: 0;
}

.mention-overlay li {
  list-style-type: none;
  cursor: pointer;
}

.mention-overlay .selected {
  font-weight: bold;
}
</style>
