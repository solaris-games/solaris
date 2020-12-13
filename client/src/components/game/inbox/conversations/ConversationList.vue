<template>
<div class="container pb-2">
  <loading-spinner :loading="!conversations"/>

  <div v-if="conversations">
    <div class="row">
      <div class="col">
        <button class="btn btn-sm btn-primary" @click="onRefreshClicked">Refresh <i class="fas fa-sync"></i></button>
      </div>
      <div class="col-auto">
        <button class="btn btn-sm btn-primary" @click="markAllAsRead" v-if="getConversationsHasUnread()">Mark All Read</button>
        <button class="btn btn-sm btn-info ml-1" @click="onCreateNewConversationRequested">
          <i class="fas fa-edit"></i>
          Create...
        </button>
      </div>
    </div>

    <div class="text-center pt-2" v-if="!conversations.length">
        No Conversations
    </div>

    <div class="pt-2">
        <conversation-preview 
          v-for="conversation in orderedConversations"
          v-bind:key="conversation._id"
          :conversation="conversation"
          :isTruncated="true"
          :isFullWidth="true"
          @onConversationOpenRequested="onConversationOpenRequested"
          class="mb-2"/>
    </div>
  </div>
</div>
</template>

<script>
import LoadingSpinnerVue from '../../../../components/LoadingSpinner'
import ConversationApiService from '../../../../services/api/conversation'
import ConversationPreviewVue from './ConversationPreview'
import gameHelper from '../../../../services/gameHelper'

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
//   created () {
//     this.sockets.subscribe('gameMessageSent', this.onMessageReceived)
//   },
//   destroyed () {
//     this.sockets.unsubscribe('gameMessageSent')
//   },
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

      return this.conversations.find(c => c.unreadCount) != null
    },
    async refreshList () {
      this.conversations = null

      try {
        let response = await ConversationApiService.list(this.$store.state.game._id)

        if (response.status === 200) {
          this.conversations = response.data
        }
      } catch (e) {
        console.error(e)
      }
    },
    // async markAllAsRead (e) {
    //   this.conversations = null

    //   try {
    //     let response = await ConversationApiService.markAllConversationsAsRead(this.$store.state.game._id)

    //     if (response.status === 200) {
    //       this.refreshList()
    //     }
    //   } catch (e) {
    //     console.error(e)
    //   }
    // },
    onConversationOpenRequested (e) {
      this.$emit('onConversationOpenRequested', e)
    },
    onCreateNewConversationRequested (e) {
      this.$emit('onCreateNewConversationRequested', e)
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
