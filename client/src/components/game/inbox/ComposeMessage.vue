<template>
<form>
    <div class="form-group mb-2">
        <!-- <label for="txtMessage">Compose Message</label> -->
        <textarea class="form-control" id="txtMessage" rows="3" placeholder="Compose a message..." v-model="message"></textarea>
    </div>
    <div class="form-group text-right">
        <button type="button" class="btn btn-success btn-block" @click="send" :disabled="isSendingMessage">Submit</button>
    </div>
</form>
</template>

<script>
import moment from 'moment'
import MessageApiService from '../../../services/api/message'
import AudioService from '../../../game/audio'
import GameHelper from '../../../services/gameHelper'

export default {
  components: {

  },
  props: {
    toPlayerId: String
  },
  data () {
    return {
      audio: null,
      message: '',
      isSendingMessage: false
    }
  },
  mounted () {
    this.audio = new AudioService(this.$store)
  },
  methods: {
    async send () {
      try {
        this.isSendingMessage = true

        let response = await MessageApiService.send(this.$store.state.game._id, this.toPlayerId, this.message)

        if (response.status === 200) {
          this.audio.type()

          this.$emit('onMessageSent', {
            fromPlayerId: GameHelper.getUserPlayer(this.$store.state.game)._id,
            toPlayerId: this.toPlayerId,
            message: this.message,
            sentDate: moment().utc()
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
