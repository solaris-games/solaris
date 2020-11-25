<template>
<div class="container pb-2">
  <menu-title title="Conversation" @onCloseRequested="onCloseRequested">
    <button class="btn btn-primary" @click="onOpenInboxRequested"><i class="fas fa-inbox"></i></button>
  </menu-title>

  <player-title :player="getPlayer(fromPlayerId)"/>

  <loading-spinner :loading="!messages"/>

  <div v-if="sortedMessages">
    <div class="pt-0 mb-2 mt-2 messages-container" v-if="sortedMessages.length">
      <div v-for="message in sortedMessages" v-bind:key="message._id">
        <div v-if="!message.sentDate">
          <conversation-trade-event :event="message"/>
        </div>

        <conversation-message 
            v-if="message.sentDate"
            :sender="getPlayer(message.fromPlayerId)"
            :message="message"
            :colour="getPlayerColour(message.fromPlayerId)"
            class="mb-1"/>
      </div>
    </div>

    <div class="pt-0 mb-2 mt-2" v-if="!sortedMessages.length">
        <p class="mb-0">No messages.</p>
    </div>

    <compose-message :toPlayerId="fromPlayerId" @onMessageSent="onMessageSent"/>
  </div>
</div>
</template>

<script>
import LoadingSpinnerVue from '../../../components/LoadingSpinner'
import MessageApiService from '../../../services/api/message'
import GameApiService from '../../../services/api/game'
import MenuTitle from '../MenuTitle'
import PlayerTitleVue from '../player/PlayerTitle'
import ComposeMessage from './ComposeMessage'
import ConversationMessageVue from './ConversationMessage'
import ConversationTradeEventVue from './ConversationTradeEvent'
import gameHelper from '../../../services/gameHelper'
import moment from 'moment'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'menu-title': MenuTitle,
    'compose-message': ComposeMessage,
    'conversation-message': ConversationMessageVue,
    'conversation-trade-event': ConversationTradeEventVue,
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
      let userPlayer = gameHelper.getUserPlayer(this.$store.state.game)

      this.messages = []

      try {
        let messagesResponse = await MessageApiService.getConversation(this.$store.state.game._id, this.fromPlayerId)
        let tradesResponse = await GameApiService.getTradeEvents(this.$store.state.game._id, 0)

        if (messagesResponse.status === 200 && tradesResponse.status === 200) {
          // Filter the trades between only the two players in the conversation.
          // TODO: This was a quick fix, this should be done server side instead.
          let tradesBetweenPlayer = tradesResponse.data
            .filter(t =>
              (t.playerId === userPlayer._id && t.data.fromPlayerId === this.fromPlayerId) ||
              (t.playerId === this.fromPlayerId && t.data.fromPlayerId === userPlayer._id) ||
              (t.playerId === userPlayer._id && t.data.toPlayerId === this.fromPlayerId) ||
              (t.playerId === this.fromPlayerId && t.data.toPlayerId === userPlayer._id)
            );

          this.messages = [
            ...messagesResponse.data,
            ...tradesBetweenPlayer
          ]
        
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
  },
  computed: {
    sortedMessages: function () {
      if (!this.messages) {
        return []
      }

      // Sort messages and trade events together ordered by date ascending.
      return this.messages.sort((a, b) => {
        // Text messages will have a "sent date" on them.
        let aMessageSentDate = a.sentDate ? moment(a.sentDate) : null
        let bMessageSentDate = b.sentDate ? moment(b.sentDate) : null
        // Trade events will have a "date" on them.
        let aTradeSentDate = a.date ? moment(a.date) : null
        let bTradeSentDate = b.date ? moment(b.date) : null

        let aDate = aMessageSentDate || aTradeSentDate
        let bDate = bMessageSentDate || bTradeSentDate

        return aDate - bDate;
      });
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
