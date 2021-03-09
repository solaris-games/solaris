<template>
<form class="pb-1">
    <div class="form-group mb-2">
        <textarea class="form-control" id="txtMessage" rows="3" placeholder="Compose a message..." ref="messageElement" :value="this.$store.state.currentConversation.text" @input="onMessageChange"></textarea>
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
      isSendingMessage: false
    }
  },
  mounted () {
    this.$store.commit('setConversationElement', {
      element: this.$refs.messageElement
    });
  },
  methods: {
    onMessageChange (e) {
      this.$store.commit('updateCurrentConversationText', {
        text: e.target.value
      })
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

          this.$store.commit('updateCurrentConversationText', {
            text: ''
          })
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

</style>
