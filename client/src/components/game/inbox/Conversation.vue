<template>
<div>
    <div class="container pb-2">
        <h3 class="pt-2">Conversation</h3>

        <div class="pt-2">
            <conversation-message v-for="message in messages" 
                v-bind:key="message._id" 
                :game="game"
                :sender="getPlayer(message.fromPlayerId)" 
                :message="message"/>
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
      return gameHelper.getPlayerColour(playerId)
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
