<template>
<form class="pb-1">
    <div class="form-group mb-2">
        <textarea class="form-control" id="txtMessage" rows="3" placeholder="Compose a message..." :value="this.conversationMessage" @input="onMessageChange"></textarea>
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
import ConversationApiService from '../../../../services/api/conversation'
import AudioService from '../../../../game/audio'

export default {
  components: {
    
  },
  props: {
    conversationId: String,
    conversationMessage: String
  },
  data () {
    return {
      isSendingMessage: false
    }
  },
  methods: {
    onMessageChange (e) {
      this.$emit('onMessageChange', e.target.value)
    },
    async send () {
      const message = this.conversationMessage.trim()

      if (message === '') {
        return
      }

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

          this.$emit('onMessageChange', '')
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
