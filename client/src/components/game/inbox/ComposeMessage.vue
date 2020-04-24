<template>
<form>
    <div class="form-group">
        <label for="txtMessage">Compose Message</label>
        <textarea class="form-control" id="txtMessage" rows="3" v-model="message"></textarea>
    </div>
    <div class="form-group text-right">
    <button type="button" class="btn btn-primary text-right" @click="send">Submit</button>
    </div>
</form>
</template>

<script>
import MessageApiService from '../../../services/api/message'

export default {
  components: {
      
  },
  props: {
    game: Object,
    toPlayerId: String
  },
  data () {
      return {
          message: ''
      }
  },
  methods: {
      async send () {
        try {
            let response = await MessageApiService.send(this.game._id, this.toPlayerId, this.message)

            if (response.status === 200) {
                this.message = '';
                
                this.$emit('onMessageSent', {
                    toPlayerId: this.toPlayerId,
                    message: this.message
                })
            }
        } catch (e) {
            console.error(e)
        }
      }
  }
}
</script>

<style scoped>
</style>
