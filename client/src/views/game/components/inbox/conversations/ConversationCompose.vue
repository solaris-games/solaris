<template>
<form class="pb-1 conversation">
  <mention-box placeholder="Compose a message" :rows="3" v-model="$store.state.currentConversation.text" @onSetMessageElement="onSetMessageElement" @onReplaceInMessage="onReplaceInMessage" @onFinish="send"></mention-box>
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
import MentionBox from '../../shared/MentionBox.vue';

export default {
  components: {
    'mention-box': MentionBox
  },
  props: {
    conversationId: String,
  },
  data () {
    return {
      isSendingMessage: false,
      currentMention: null,
      selectedSuggestion: null
    }
  },
  methods: {
    onSetMessageElement (element) {
      this.$store.commit('setMentions', {
        element,
        callbacks: {
          player: (player) => {
            this.$store.commit('updateCurrentConversationText', MentionHelper.addMention(this.$store.state.currentConversation.text, this.$store.state.mentionReceivingElement, 'player', player.alias))
          },
          star: (star) => {
            this.$store.commit('updateCurrentConversationText', MentionHelper.addMention(this.$store.state.currentConversation.text, this.$store.state.mentionReceivingElement, 'star', star.name))
          }
        }
      })
    },
    onReplaceInMessage (data) {
      this.$store.commit('updateCurrentConversationText', MentionHelper.useSuggestion(this.$store.state.currentConversation.text, this.$store.state.mentionReceivingElement, data))
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
