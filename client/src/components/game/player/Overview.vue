<template>
<div v-if="player">
  <player-title :player="player"/>

  <div class="row">
      <div class="col-auto text-center pl-0 pr-0">
        <img v-if="player.avatar" :src="getAvatarImage()">
        <i v-if="!player.avatar" class="far fa-user mr-2 mt-2 ml-2 mb-2" style="font-size:100px;"></i>
      </div>
      <div class="col bg-secondary">
          <statistics :playerId="playerId"/>
      </div>
  </div>

  <div class="row pt-2 pb-2 bg-primary" v-if="!(!userPlayer || !gameHasStarted || player.userId)">
    <div class="col">
      <button class="btn btn-success mr-1" @click="onViewConversationRequested"
        :class="{'btn-warning': conversation && conversation.unreadCount}">
        <i class="fas fa-envelope"></i>
        <span v-if="conversation && conversation.unreadCount" class="ml-1">{{conversation.unreadCount}}</span>
      </button>
      <button class="btn btn-info" v-if="!isDarkModeExtra" @click="onViewCompareIntelRequested">
        <i class="fas fa-chart-line"></i>
        Intel
      </button>
    </div>
    <div class="col-auto">
      <button class="btn btn-warning" v-if="!gameHasFinished" @click="onOpenTradeRequested">
        <i class="fas fa-handshake"></i>
        Trade
      </button>
    </div>
  </div>
</div>
</template>

<script>
import Statistics from './Statistics'
import PlayerTitleVue from './PlayerTitle'
import gameHelper from '../../../services/gameHelper'
import ConversationApiService from '../../../services/api/conversation'

export default {
  components: {
    'statistics': Statistics,
    'player-title': PlayerTitleVue
  },
  props: {
    playerId: String
  },
  data () {
    return {
      userPlayer: null,
      player: null,
      gameHasStarted: null,
      gameHasFinished: null,
      conversation: null
    }
  },
  async mounted () {
    this.userPlayer = gameHelper.getUserPlayer(this.$store.state.game)
    this.player = gameHelper.getPlayerById(this.$store.state.game, this.playerId)

    this.gameHasStarted = this.$store.state.game.state.startDate != null
    this.gameHasFinished = this.$store.state.game.state.endDate != null

    await this.loadConversation()
  },
  methods: {
    onViewConversationRequested (e) {
      if (this.conversation) {
        this.$emit('onViewConversationRequested', {
          conversationId: this.conversation._id
        })
      } else {
        this.$emit('onViewConversationRequested', {
          participantIds: [
            this.userPlayer._id,
            this.player._id
          ]
        })
      }
    },
    onViewCompareIntelRequested (e) {
      this.$emit('onViewCompareIntelRequested', this.player._id)
    },
    onOpenTradeRequested (e) {
      this.$emit('onOpenTradeRequested', this.playerId)
    },
    getAvatarImage () {
      return require(`../../../assets/avatars/${this.player.avatar}.png`)
    },
    async loadConversation () {
      if (this.userPlayer && this.userPlayer._id !== this.player._id) {
        try {
          let response = await ConversationApiService.privateChatSummary(this.$store.state.game._id, this.player._id)

          if (response.status === 200) {
            this.conversation = response.data
          }
        } catch (err) {
          console.error(err)
        }
      }
    }
  },
  computed: {
    isDarkModeExtra () {
      return gameHelper.isDarkModeExtra(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
</style>
