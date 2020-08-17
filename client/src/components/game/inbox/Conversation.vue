<template>
<div class="container pb-2">
  <menu-title title="Conversation" @onCloseRequested="onCloseRequested">
    <button class="btn btn-primary" @click="onOpenInboxRequested"><i class="fas fa-inbox"></i></button>
  </menu-title>

  <player-title :player="getPlayer(fromPlayerId)"/>
    
  <loading-spinner :loading="!messages"/>

  <div v-if="messages">
    <div class="pt-0 mb-2 mt-2 messages-container" v-if="messages.length">
        <conversation-message v-for="message in messages" 
            v-bind:key="message._id" 
            :sender="getPlayer(message.fromPlayerId)" 
            :message="message"
            :colour="getPlayerColour(message.fromPlayerId)"
            :isTruncated="false"
            class="mb-1"/>
    </div>
    
    <div class="pt-0 mb-2 mt-2" v-if="!messages.length">
        <p class="mb-0">No messages.</p>
    </div>

    <compose-message :toPlayerId="fromPlayerId" @onMessageSent="onMessageSent"/>
  </div>
</div>
</template>

<script>
import LoadingSpinnerVue from '../../../components/LoadingSpinner'
import MessageApiService from '../../../services/api/message'
import MenuTitle from '../MenuTitle'
import PlayerTitleVue from '../player/PlayerTitle'
import ComposeMessage from './ComposeMessage'
import ConversationMessageVue from './ConversationMessage'
import gameHelper from '../../../services/gameHelper'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'menu-title': MenuTitle,
    'compose-message': ComposeMessage,
    'conversation-message': ConversationMessageVue,
    'player-title': PlayerTitleVue
  },
  props: {
    fromPlayerId: String
  },
  data () {
      return {
          messages: null
      }
  },
  mounted () {
    this.loadMessages()
  },
  created () {
    this.sockets.subscribe('gameMessageSent', this.onMessageReceived)
  },
  destroyed () {
    this.sockets.unsubscribe('gameMessageSent')
  },
  methods: {
    onCloseRequested (e) {
        this.$emit('onCloseRequested', e)
    },
    onOpenInboxRequested (e) {
      this.$emit('onOpenInboxRequested', e)
    },
    getPlayer (playerId) {
      return this.$store.state.game.galaxy.players.find(p => p._id === playerId)
    },
    getPlayerColour (playerId) {
      return gameHelper.getPlayerColour(this.$store.state.game, playerId)
    },
    async loadMessages () {
      this.messages = []

        try {
            let response = await MessageApiService.getConversation(this.$store.state.game._id, this.fromPlayerId)

            if (response.status === 200) {
                this.messages = response.data

                this.scrollToEnd()
            }
        } catch (e) {
            console.error(e)
        }
    },
    onMessageSent (e) {
        this.loadMessages()
    },
    onMessageReceived (e) {
      this.messages.push(e)

      this.scrollToEnd()
    },
    scrollToEnd () {
      // This doesn't seem to work inline, have to wait 100ms so that the UI can update itself
      // before scrolling the div container to the bottom.
      setTimeout(() => {
        if (this.messages.length) {
          const messagesContainer = this.$el.querySelector('.messages-container')
          messagesContainer.scrollTop = messagesContainer.scrollHeight
        }
      }, 100)
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
