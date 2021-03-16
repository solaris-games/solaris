<template>
<form class="pb-1 conversation">
    <div class="mention-overlay bg-secondary" v-if="suggestMentions && focused">
      <ul>
        <li v-for="suggestion in this.$store.state.currentConversation.suggestions" :key="suggestion">{{suggestion}}</li>
      </ul>
    </div>
    <div class="form-group mb-2">
        <textarea class="form-control" id="txtMessage" rows="3" placeholder="Compose a message..." ref="messageElement" :value="this.$store.state.currentConversation.text" @input="onMessageChange" @focus="onFocus" @blur="onBlur" @keydown="onKeyDown"></textarea>
    </div>
    <div class="form-group text-right">
        <button type="button" class="btn btn-success btn-block" @click="send" :disabled="isSendingMessage">
          <i class="fas fa-paper-plane"></i>
          Send Message
        </button>
    </div>
</form>
</template>

<script>
import moment from 'moment'
import GameHelper from '../../../../services/gameHelper'
import MentionHelper from '../../../../services/mentionHelper';
import ConversationApiService from '../../../../services/api/conversation'
import AudioService from '../../../../game/audio'

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
      suggestMentions: false
    }
  },
  mounted () {
    this.$store.commit('setConversationElement', this.$refs.messageElement)
    this.suggestMentions = this.$store.state.settings.interface.suggestMentions
  },
  methods: {
    onFocus (e) {
      this.focused = true
    },
    onBlur (e) {
      this.focused = false
    },
    onKeyDown (e) {
      if (this.suggestMentions) {
        this.$store.commit('updateConversationSuggestions', e.key)
      }
    },
    onMessageChange (e) {
      this.$store.commit('updateCurrentConversationText', e.target.value)
    },
    async send () {
      const messageText = this.$store.state.currentConversation.text

      if (!messageText) {
        return
      }

      const message = MentionHelper.makeMentionsStatic(this.$store.state.game, messageText)

      try {
        this.isSendingMessage = true

        let response = await ConversationApiService.send(this.$store.state.game._id, this.conversationId, message)

        if (response.status === 200) {
          AudioService.type()

          let userPlayerId = GameHelper.getUserPlayer(this.$store.state.game)._id

          this.$emit('onConversationMessageSent', {
            conversationId: this.conversationId,
            fromPlayerId: userPlayerId,
            message: message,
            sentDate: moment().utc(),
            readBy: [userPlayerId],
            type: 'message'
          })

          this.$store.commit('resetCurrentConversationText')
        }
      } catch (e) {
        console.error(e)
      }

      this.isSendingMessage = false
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
}

.mention-overlay li {
  list-style-type: none;
}
</style>
