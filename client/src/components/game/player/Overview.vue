<template>
<div v-if="player">
  <player-title :player="player"/>

  <div class="row">
      <div class="col-auto">
          <div class="row col pt-4 pb-2">
              <!-- TODO: Prefer images over font awesome icons? -->
              <i class="far fa-user" style="font-size:100px;"></i>
              <!-- <img src="" height="100"> -->
          </div>
          <div class="row bg-primary">
              <div class="col pt-2 pb-2">
                  <button class="btn btn-success" :disabled="!gameHasStarted || player.userId" @click="onViewConversationRequested"><i class="fas fa-envelope"></i></button>
                  <button class="btn btn-info ml-1" :disabled="!gameHasStarted || player.userId" @click="onViewCompareIntelRequested"><i class="fas fa-chart-line"></i></button>
              </div>
          </div>
      </div>
      <div class="col bg-secondary">
          <statistics :player="player"/>
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
    player: Object
  },
  data () {
    return {
      gameHasStarted: null
    }
  },
  mounted () {
    this.gameHasStarted = this.$store.state.game.state.startDate != null
  },
  methods: {
    onViewConversationRequested (e) {
      this.$emit('onViewConversationRequested', this.player._id)
    },
    onViewCompareIntelRequested (e) {
      this.$emit('onViewCompareIntelRequested', this.player._id)
    }
  }
}
</script>

<style scoped>
</style>
