<template>
<div>
    <div class="container">
        <button class="btn btn-primary"><i class="fas fa-envelope"></i></button>
        <button class="btn btn-primary ml-1"><i class="fas fa-sync"></i></button>
        <button class="btn btn-primary float-right">Mark All Read</button>
    </div>

    <div class="text-center pt-2" v-if="!conversations.length">
        No Messages
    </div>
    
    <div class="pt-2">
        <conversation-message v-for="conversation in conversations" 
          v-bind:key="conversation.playerId" :game="game" 
          :sender="getPlayer(conversation.playerId)" 
          :message="conversation.lastMessage" 
          @onConversationOpenRequested="onConversationOpenRequested"/>
    </div>
</div>
</template>

<script>
import MessageApiService from '../../../services/api/message'
import ConversationMessageVue from './ConversationMessage'

export default {
  components: {
    'conversation-message': ConversationMessageVue
  },
  props: {
    game: Object
  },
  data () {
    return {
      conversations: []
    }
  },
  async mounted () {
    try {
      let result = await MessageApiService.getConversations(this.game._id)

      if (result.status === 200) {
        this.conversations = result.data
      }
    } catch (e) {
      console.error(e)
    }
  },
  methods: {
    getPlayer (playerId) {
      return this.game.galaxy.players.find(p => p._id === playerId)
    },
    onConversationOpenRequested (e) {
      this.$emit('onConversationOpenRequested', e)
    }
  }
}
</script>

<style scoped>
</style>
