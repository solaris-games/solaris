<template>
<div class="container pb-2">
  <loading-spinner :loading="!conversations"/>
    
  <div v-if="conversations">
    <div>
        <button class="btn btn-primary" @click="onRefreshClicked"><i class="fas fa-sync"></i></button>
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
          :colour="getPlayerColour(conversation.playerId)"
          @onConversationOpenRequested="onConversationOpenRequested"
          class="mb-2"/>
    </div>
  </div>
</div>
</template>

<script>
import LoadingSpinnerVue from '../../../components/LoadingSpinner'
import MessageApiService from '../../../services/api/message'
import ConversationMessageVue from './ConversationMessage'
import gameHelper from '../../../services/gameHelper'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'conversation-message': ConversationMessageVue
  },
  props: {
    game: Object
  },
  data () {
    return {
      conversations: null
    }
  },
  mounted () {
    this.refreshList()
  },
  methods: {
    getPlayer (playerId) {
      return gameHelper.getPlayerById(this.game, playerId)
    },
    getPlayerColour (playerId) {
      return gameHelper.getPlayerColour(this.game, playerId)
    },
    async refreshList () {
      this.conversations = null
      
      try {
        let response = await MessageApiService.getConversations(this.game._id)

        if (response.status === 200) {
          this.conversations = response.data
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
    }
  }
}
</script>

<style scoped>
</style>
