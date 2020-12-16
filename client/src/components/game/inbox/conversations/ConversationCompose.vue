<template>
<form class="pb-1">
    <div class="form-group mb-2">
        <textarea class="form-control" id="txtMessage" rows="3" placeholder="Compose a message..." v-model="message"></textarea>
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
    conversationId: String
  },
  data () {
    return {
      message: '',
      isSendingMessage: false
    }
  },
  methods: {
    async send () {
      try {
        this.isSendingMessage = true

        let response = await ConversationApiService.send(this.$store.state.game._id, this.conversationId, this.message)

        if (response.status === 200) {
          AudioService.type()

          let userPlayerId = GameHelper.getUserPlayer(this.$store.state.game)._id

          this.$emit('onConversationMessageSent', {
            conversationId: this.conversationId,
            fromPlayerId: userPlayerId,
            message: this.message,
            sentDate: moment().utc(),
            readBy: [userPlayerId],
            type: 'message'
          })

          this.message = ''
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
