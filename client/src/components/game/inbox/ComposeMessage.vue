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
import MessageApiService from '../../../services/api/message'
import AudioService from '../../../game/audio'

export default {
  components: {

  },
  props: {
    toPlayerId: String
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

        let response = await MessageApiService.send(this.$store.state.game._id, this.toPlayerId, this.message)

        if (response.status === 200) {
          AudioService.type()

          this.message = ''

          this.$emit('onMessageSent', {
            toPlayerId: this.toPlayerId,
            message: this.message
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
