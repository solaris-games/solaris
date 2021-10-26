<template>
<div class="menu-page">
  <loading-spinner :loading="!conversation"/>

  <div class="container" v-if="conversation">
    <menu-title :title="conversation.name" @onCloseRequested="onCloseRequested">
      <button class="btn btn-sm" v-if="conversation.createdBy" :class="{'btn-default':!pinnedOnly, 'btn-success':pinnedOnly}" title="Show/Hide Pinned Only" @click="toggledPinnedOnly">
        <i class="fas fa-thumbtack"></i>
      </button>
      <button class="btn btn-sm btn-info ml-1" @click="toggleConversationWindow" title="Toggle Conversation Display">
        <i class="fas" :class="{'fa-eye-slash':!toggleDisplay,'fa-eye':toggleDisplay}"></i>
      </button>
      <button class="btn btn-sm btn-primary ml-1" @click="onOpenInboxRequested" title="Back to Inbox"><i class="fas fa-inbox"></i></button>
      <button class="btn btn-sm btn-warning ml-1" @click="leaveConversation" v-if="conversation.createdBy" title="Leave"><i class="fas fa-sign-out-alt"></i></button>
    </menu-title>

    <p v-if="!toggleDisplay" class="pb-2 text-warning">
      <small><i>Click the <i class="fas fa-eye-slash"></i> button to view the conversation.</i></small>
    </p>

    <conversation-participants v-if="toggleDisplay" :conversation="conversation" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>

    <div class="messages-container">
      <div class="pt-0 mb-2 mt-2" v-if="toggleDisplay && filteredMessages.length">
        <div v-for="message in filteredMessages" v-bind:key="message._id" class="mb-1">
          <conversation-message v-if="message.type === 'message'" :conversation="conversation" :message="message" 
            @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
            @onMinimizeConversationRequested="toggleConversationWindow"/>
          <conversation-trade-event v-if="message.type !== 'message'" :event="message"/>
        </div>
      </div>
    </div>

    <div class="pt-0 mb-2 mt-2" v-if="toggleDisplay && !filteredMessages.length">
        <p class="mb-0 text-center">No messages.</p>
    </div>

    <compose-conversation-message v-if="toggleDisplay" :conversationId="conversationId" @onConversationMessageSent="onConversationMessageSent" />
  </div>
</div>
</template>

<script>
import eventBus from '../../../../eventBus'
import GameHelper from '../../../../services/gameHelper'
import ConversationApiService from '../../../../services/api/conversation'
import LoadingSpinnerVue from '../../../../components/LoadingSpinner'
import MenuTitle from '../../MenuTitle'
import ConversationParticipantsVue from './ConversationParticipants'
import ComposeMessageVue from './ConversationCompose'
import ConversationMessageVue from './ConversationMessage'
import ConversationTradeEventVue from './ConversationTradeEvent.vue'

export default {
  components: {
    'menu-title': MenuTitle,
    'loading-spinner': LoadingSpinnerVue,
    'conversation-participants': ConversationParticipantsVue,
    'compose-conversation-message': ComposeMessageVue,
    'conversation-message': ConversationMessageVue,
    'conversation-trade-event': ConversationTradeEventVue
  },
  props: {
    conversationId: String,
  },
  data () {
    return {
      conversation: null,
      userPlayer: null,
      toggleDisplay: true,
      pinnedOnly: false
    }
  },
  created () {
    this.sockets.subscribe('gameMessageSent', this.onMessageReceived)
    this.sockets.subscribe('gameConversationRead', this.onConversationRead)
    this.sockets.subscribe('gameConversationLeft', this.onConversationLeft)
    this.sockets.subscribe('gameConversationMessagePinned', this.onConversationMessagePinned)
    this.sockets.subscribe('gameConversationMessageUnpinned', this.onConversationMessageUnpinned)
    this.sockets.subscribe('playerCreditsReceived', this.onTradeEventReceived)
    this.sockets.subscribe('playerCreditsSpecialistsReceived', this.onTradeEventReceived)
    this.sockets.subscribe('playerRenownReceived', this.onTradeEventReceived)
    this.sockets.subscribe('playerTechnologyReceived', this.onTradeEventReceived)
  },
  destroyed () {
    this.sockets.unsubscribe('gameMessageSent')
    this.sockets.unsubscribe('gameConversationRead')
    this.sockets.unsubscribe('gameConversationLeft')
    this.sockets.unsubscribe('playerCreditsReceived')
    this.sockets.unsubscribe('playerCreditsSpecialistsReceived')
    this.sockets.unsubscribe('playerRenownReceived')
    this.sockets.unsubscribe('playerTechnologyReceived')

    this.$store.commit('closeConversation')
  },
  async mounted () {
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)

    await this.loadConversation()
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onOpenInboxRequested (e) {
      eventBus.$emit('onOpenInboxRequested', e)
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    },
    toggleConversationWindow (e) {
      this.toggleDisplay = !this.toggleDisplay
    },
    onConversationMessageSent (e) {
      this.conversation.messages.push(e)

      this.scrollToEnd()
    },
    onMessageReceived (e) {
      if (e.conversationId === this.conversation._id) {
        this.conversation.messages.push(e)

        this.scrollToEnd()
      }
    },
    onConversationRead (e) {
      if (e.conversationId === this.conversation._id) {
        let messages = this.conversation.messages.filter(m => m.type === 'message')

        for (let message of messages) {
          if (message.readBy.indexOf(e.readByPlayerId) < 0) {
            message.readBy.push(e.readByPlayerId)
          }
        }
      }
    },
    onConversationLeft (e) {
      if (e.conversationId === this.conversation._id) {
        this.conversation.participants.splice(this.conversation.participants.indexOf(e.playerId), 1)
      }
    },
    onConversationMessagePinned (e) {
      if (e.conversationId === this.conversation._id) {
        let message = this.conversation.messages.find(m => m._id === e.messageId)

        if (message) {
          message.pinned = true
        }
      }
    },
    onConversationMessageUnpinned (e) {
      if (e.conversationId === this.conversation._id) {
        let message = this.conversation.messages.find(m => m._id === e.messageId)

        if (message) {
          message.pinned = false
        }
      }
    },
    onTradeEventReceived (e) {
      if (this.conversation.participants.length !== 2) {
        return
      }

      let partnerPlayerId = this.conversation.participants.filter(p => p !== this.userPlayer._id)[0]

      let isTradeEventBetweenPlayers = (e.playerId === this.userPlayer._id && e.data.fromPlayerId === partnerPlayerId) ||
        (e.playerId === partnerPlayerId && e.data.fromPlayerId === this.userPlayer._id) ||
        (e.playerId === this.userPlayer._id && e.data.toPlayerId === partnerPlayerId) ||
        (e.playerId === partnerPlayerId && e.data.toPlayerId === this.userPlayer._id)

      if (isTradeEventBetweenPlayers) {
        this.conversation.messages.push(e)

        this.scrollToEnd()
      }
    },
    scrollToEnd () {
      // This doesn't seem to work inline, have to wait 100ms so that the UI can update itself
      // before scrolling the div container to the bottom.
      setTimeout(async () => {
        if (this.conversation && this.conversation.messages.length) {
          const messagesContainer = this.$el.querySelector('.messages-container')
          messagesContainer.scrollTop = messagesContainer.scrollHeight

          await this.markConversationAsRead()
        }
      }, 100)
    },
    toggledPinnedOnly () {
      this.pinnedOnly = !this.pinnedOnly
      this.scrollToEnd()
    },
    async loadConversation () {
      this.conversation = null

      try {
        let response = await ConversationApiService.detail(this.$store.state.game._id, this.conversationId)

        if (response.status === 200) {
          this.conversation = response.data
          this.$store.commit('openConversation', this.conversationId)
        
          this.scrollToEnd()
        }
      } catch (e) {
        console.error(e)
      }
    },
    async markConversationAsRead () {
      try {
        await ConversationApiService.markAsRead(this.$store.state.game._id, this.conversation._id)
      } catch (err) {
        console.error(err)
      }
    },
    async leaveConversation () {
      if (await this.$confirm('Leave conversation', `Are you sure you want to leave this conversation?`)) {
        try {
          this.onOpenInboxRequested()

          await ConversationApiService.leave(this.$store.state.game._id, this.conversation._id)
        } catch (err) {
          console.error(err)
        }
      }
    }
  },
  computed: {
    filteredMessages () {
      if (!this.pinnedOnly) {
        return this.conversation.messages
      } else {
        return this.conversation.messages.filter(m => m.pinned)
      }
    }
  }
}
</script>

<style scoped>
.messages-container {
  max-height: 400px;
  overflow: auto;
}
</style>
