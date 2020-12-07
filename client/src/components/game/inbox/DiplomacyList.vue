<template>
<div class="container pb-2">
  <loading-spinner :loading="!conversations"/>
  <div v-if="conversations">
    <div>
        <button class="btn btn-primary" @click="onRefreshClicked">Refresh <i class="fas fa-sync"></i></button>
        <button class="btn btn-primary float-right" @click="markAllAsRead" v-if="getConversationsHasUnread()">Mark All Read</button>
    </div>

    <div class="text-center pt-2" v-if="!conversations.length">
        No Messages
    </div>

    <div class="pt-2">
        <conversation-preview v-for="conversation in orderedConversations"
          v-bind:key="conversation.playerId"
          :sender="getPlayer(conversation.playerId)"
          :message="conversation.lastMessage"
          :colour="getPlayerColour(conversation.playerId)"
          :isUnread="conversation.hasUnread"
          :isTruncated="true"
          :isFullWidth="true"
          @onConversationOpenRequested="onConversationOpenRequested"
          class="mb-2"/>
    </div>
  </div>
</div>
</template>

<script>
import LoadingSpinnerVue from '../../../components/LoadingSpinner'
import MessageApiService from '../../../services/api/message'
import ConversationPreviewVue from './ConversationPreview'
import gameHelper from '../../../services/gameHelper'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'conversation-preview': ConversationPreviewVue
  },
  data () {
    return {
      conversations: null
    }
  },
  computed: {
    orderedConversations: function() {
      return this.conversations.sort(function(a,b) {
        if (a === b) {
          return 0
        }
        else if (a.lastMessage === null) {
          return 1
        }
        else if (b.lastMessage === null) {
          return -1
        }
        else {
          return b.lastMessage.sentDate.localeCompare(a.lastMessage.sentDate)
        }
      });
    }
  },
  mounted () {
    this.refreshList()
  },
  created () {
    this.sockets.subscribe('gameMessageSent', this.onMessageReceived)
  },
  destroyed () {
    this.sockets.unsubscribe('gameMessageSent')
  },
  methods: {
    getPlayer (playerId) {
      return gameHelper.getPlayerById(this.$store.state.game, playerId)
    },
    getPlayerColour (playerId) {
      return gameHelper.getPlayerColour(this.$store.state.game, playerId)
    },
    getConversationsHasUnread () {
      if (!this.conversations) {
        return false
      }

      return this.conversations.find(c => c.hasUnread) != null
    },
    async refreshList () {
      this.conversations = null

      try {
        let response = await MessageApiService.getConversations(this.$store.state.game._id)

        if (response.status === 200) {
          this.conversations = response.data
        }
      } catch (e) {
        console.error(e)
      }
    },
    async markAllAsRead (e) {
      this.conversations = null

      try {
        let response = await MessageApiService.markAllConversationsAsRead(this.$store.state.game._id)

        if (response.status === 200) {
          this.refreshList()
        }
      } catch (e) {
        console.error(e)
      }
    },
    onConversationOpenRequested (e) {
      this.$emit('onConversationOpenRequested', e)
    },
    onRefreshClicked (e) {
      this.refreshList()
    },
    onMessageReceived (e) {
      // Find the conversation that this message is for and replace the last message.
      let convo = this.conversations.find(c => c.playerId === e.fromPlayerId)

      convo.lastMessage = e
    }
  }
}
</script>

<style scoped>
</style>
