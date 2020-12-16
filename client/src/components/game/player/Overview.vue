<template>
<div v-if="player">
  <player-title :player="player"/>

  <div class="row">
      <div class="col-auto">
          <div class="row col pl-0 pr-0 text-center">
              <img v-if="player.avatar" :src="getAvatarImage()" height="128">
              <i v-if="!player.avatar" class="far fa-user mr-2 mt-2 ml-2 mb-2" style="font-size:100px;"></i>
          </div>
          <div class="row bg-primary">
              <div class="col pt-2 pb-2">
                <!-- TODO: Figure out how to open the conversation with the player -->
                <!-- <button class="btn btn-success" :disabled="!gameHasStarted || player.userId" @click="onViewConversationRequested"><i class="fas fa-envelope"></i></button> -->
                <button class="btn btn-info ml-1" :disabled="!gameHasStarted || player.userId" @click="onViewCompareIntelRequested">
                  <i class="fas fa-chart-line"></i>
                  Intel
                </button>
              </div>
          </div>
      </div>
      <div class="col bg-secondary">
          <statistics :playerId="playerId"/>
      </div>
  </div>
</div>
</template>

<script>
import Statistics from './Statistics'
import PlayerTitleVue from './PlayerTitle'
import gameHelper from '../../../services/gameHelper'

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
      player: null,
      gameHasStarted: null
    }
  },
  mounted () {
    this.player = gameHelper.getPlayerById(this.$store.state.game, this.playerId)

    this.gameHasStarted = this.$store.state.game.state.startDate != null
  },
  methods: {
    onViewConversationRequested (e) {
      this.$emit('onViewConversationRequested', this.player._id)
    },
    onViewCompareIntelRequested (e) {
      this.$emit('onViewCompareIntelRequested', this.player._id)
    },
    getAvatarImage () {
      return require(`../../../assets/avatars/${this.player.avatar}.png`)
    }
  }
}
</script>

<style scoped>
</style>
