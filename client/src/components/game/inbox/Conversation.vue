<template>
<div>
    <div class="container pb-2">
        <h3 class="pt-2">Conversation</h3>

        <div class="pt-0 mb-2" v-if="messages.length">
            <conversation-message v-for="message in messages" 
                v-bind:key="message._id" 
                :game="game"
                :sender="getPlayer(message.fromPlayerId)" 
                :message="message"
                :colour="getPlayerColour(message.fromPlayerId)"
                class="mb-1"/>

        </div>
        
        <div class="pt-0 mb-2" v-if="!messages.length">
            <p class="mb-0" v-if="!messages.length">No messages.</p>
        </div>

        <compose-message :game="game" :toPlayerId="fromPlayerId" @onMessageSent="onMessageSent"/>
    </div>
</div>
</template>

<script>
import MessageApiService from '../../../services/api/message'
import ComposeMessage from './ComposeMessage'
import ConversationMessageVue from './ConversationMessage'
import gameHelper from '../../../services/gameHelper'

export default {
  components: {
    'compose-message': ComposeMessage,
    'conversation-message': ConversationMessageVue
  },
  props: {
    game: Object,
    fromPlayerId: String
  },
  data () {
      return {
          messages: []
      }
  },
  mounted () {
    this.loadMessages()
  },
  methods: {
    getPlayer (playerId) {
      return this.game.galaxy.players.find(p => p._id === playerId)
    },
    getPlayerColour (playerId) {
      return gameHelper.getPlayerColour(this.game, playerId)
    },
    async loadMessages () {
        try {
            let response = await MessageApiService.getConversation(this.game._id, this.fromPlayerId)

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
