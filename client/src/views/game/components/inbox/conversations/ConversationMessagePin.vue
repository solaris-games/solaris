<template>
  <span class="pointer thumbtack" @click="togglePinned">
    <i class="fas fa-thumbtack"></i>
  </span>
</template>

<script>
import ConversationApiService from '../../../../../services/api/conversation'

export default {
  props: {
    conversationId: String,
    messageId: String,
    pinned: Boolean
  },
  methods: {
    async togglePinned () {
      try {
        if (!this.pinned) {
          await ConversationApiService.pinMessage(this.$store.state.game._id, this.conversationId, this.messageId)

          this.$emit('onPinned')
        } else {
          await ConversationApiService.unpinMessage(this.$store.state.game._id, this.conversationId, this.messageId)

          this.$emit('onUnpinned')
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
