<template>
  <div class="col-auto" v-if="message.fromPlayerId && !isFromUserPlayer">
    <div class="dropdown-container">
      <button class="btn btn-sm" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <i class="fas fa-ellipsis"></i>
      </button>
      <div class="dropdown-menu dropdown-menu-right">
        <button class="btn btn-small dropdown-item" @click="onViewConversationRequested(message.fromPlayerId)"
                v-if="conversation.participants.length > 2 && canCreateConversation">Direct Message</button>
        <button class="btn btn-small dropdown-item" @click="reportMessage">Report</button>
      </div>
    </div>
  </div>
</template>

<script>
import gameHelper from "../../../../../services/gameHelper";
import eventBus from "../../../../../eventBus";
import ConversationApiService from "../../../../../services/api/conversation";

export default {
  name: "ConversationMessageContextMenu",
  props: {
    message: Object,
    conversation: Object,
    userPlayer: Object
  },
  methods: {
    async onViewConversationRequested (playerId) {
      const conversation = await this.loadConversation(playerId);

      if (conversation) {
        eventBus.$emit('onViewConversationRequested', {
          conversationId: conversation._id
        })
      } else {
        eventBus.$emit('onViewConversationRequested', {
          participantIds: [
            this.userPlayer._id,
            this.message.fromPlayerId
          ]
        })
      }
    },
    async loadConversation (playerId) {
      if (this.userPlayer && this.userPlayer._id !== playerId) {
        try {
          let response = await ConversationApiService.privateChatSummary(this.$store.state.game._id, playerId)

          if (response.status === 200) {
            return response.data
          }
        } catch (err) {
          console.error(err)
        }
        return null;
      }
    },
    reportMessage () {
      this.$emit('onOpenReportPlayerRequested', {
        playerId: this.message.fromPlayerId,
        messageId: this.message._id,
        conversationId: this.conversation._id
      })
    },
  },
  computed: {
    canCreateConversation: function () {
      return this.$store.state.game.settings.general.playerLimit > 2
        && !gameHelper.isTutorialGame(this.$store.state.game)
    },
    isFromUserPlayer: function () {
      return this.message.fromPlayerId === this.userPlayer._id
    },
  }
}
</script>

<style scoped>

</style>
