<template>
<div class="container pb-2">
  <menu-title title="Conversation" @onCloseRequested="onCloseRequested"/>

  <player-overview :player="getPlayer(fromPlayerId)"/>

  <loading-spinner :loading="!messages"/>

  <div v-if="messages">
    <div class="pt-0 mb-2 mt-2" v-if="messages.length">
        <conversation-message v-for="message in messages" 
            v-bind:key="message._id" 
           
            :sender="getPlayer(message.fromPlayerId)" 
            :message="message"
            :colour="getPlayerColour(message.fromPlayerId)"
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
import PlayerOverview from '../player/Overview'
import ComposeMessage from './ComposeMessage'
import ConversationMessageVue from './ConversationMessage'
import gameHelper from '../../../services/gameHelper'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'menu-title': MenuTitle,
    'compose-message': ComposeMessage,
    'conversation-message': ConversationMessageVue,
    'player-overview': PlayerOverview
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
  methods: {
    onCloseRequested (e) {
        this.$emit('onCloseRequested', e)
    },
    getPlayer (playerId) {
      return this.$store.state.game.galaxy.players.find(p => p._id === playerId)
    },
    getPlayerColour (playerId) {
      return gameHelper.getPlayerColour(this.$store.state.game, playerId)
    },
    async loadMessages () {
        try {
            let response = await MessageApiService.getConversation(this.$store.state.game._id, this.fromPlayerId)

            if (response.status === 200) {
                this.messages = response.data
            }
        } catch (e) {
            console.error(e)
        }
    },
    onMessageSent (e) {
        this.loadMessages()
    }
  }
}
</script>

<style scoped>
</style>
