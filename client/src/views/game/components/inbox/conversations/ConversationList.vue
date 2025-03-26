<template>
<div class="container pb-2">
  <loading-spinner :loading="!conversations"/>

  <div v-if="conversations">
    <div class="row">
      <div class="col">
        <button class="btn btn-sm btn-outline-primary" @click="onRefreshClicked"><i class="fas fa-sync"></i> Refresh</button>
      </div>
      <div class="col-auto" v-if="canCreateConversation">
        <!-- <button class="btn btn-sm btn-primary" @click="markAllAsRead" v-if="getConversationsHasUnread()">Mark All Read</button> -->
        <button class="btn btn-sm btn-info ms-1" @click="onCreateNewConversationRequested">
          <i class="fas fa-comments"></i>
          Create...
        </button>
      </div>
    </div>

    <div class="text-center pt-2" v-if="!conversations.length">
        No Conversations.
    </div>

    <div class="pt-2">
        <conversation-preview
          v-for="conversation in orderedConversations"
          v-bind:key="conversation._id"
          :conversation="conversation"
          :isTruncated="true"
          :isFullWidth="true"
          class="mb-2"/>
    </div>
  </div>
</div>
</template>

<script>
import { eventBusInjectionKey } from '../../../../../eventBus'
import LoadingSpinnerVue from '../../../../components/LoadingSpinner.vue'
import ConversationApiService from '../../../../../services/api/conversation'
import ConversationPreviewVue from './ConversationPreview.vue'
import gameHelper from '../../../../../services/gameHelper'
import { inject } from 'vue'
import MenuEventBusEventNames from '../../../../../eventBusEventNames/menu'
import UserEventBusEventNames from "../../../../../eventBusEventNames/user";

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
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
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
    },
    canCreateConversation: function () {
      return this.$store.state.game.settings.general.playerLimit > 2
        && !gameHelper.isTutorialGame(this.$store.state.game)
    }
  },
  mounted () {
    this.refreshList()
    this.eventBus.on(UserEventBusEventNames.GameMessageSent, this.onMessageReceived);
  },
  unmounted () {
    this.eventBus.off(UserEventBusEventNames.GameMessageSent, this.onMessageReceived);
  },
  methods: {
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
    onCreateNewConversationRequested (e) {
      this.eventBus.emit(MenuEventBusEventNames.OnCreateNewConversationRequested, e)
    },
    onRefreshClicked (e) {
      this.refreshList()
    },
    onMessageReceived (e) {
      // Find the conversation that this message is for and replace the last message.
      let convo = this.conversations.find(c => c._id === e.conversationId)

      convo.lastMessage = e
      convo.unreadCount++
    }
  }
}
</script>

<style scoped>
</style>
