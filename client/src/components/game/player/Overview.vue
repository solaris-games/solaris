<template>
<div>
  <div class="row" :style="{'background-color': getFriendlyColour(player.colour.value)}">
      <div class="col">
          <h4 class="pt-2">{{player.alias}} <span v-if="player.userId">(You)</span></h4>
      </div>
  </div>

  <div class="row">
      <div class="col-auto">
          <div class="row col pt-4 pb-2">
              <!-- TODO: Prefer images over font awesome icons? -->
              <i class="far fa-user" style="font-size:100px;"></i>
              <!-- <img src="" height="100"> -->
          </div>
          <div class="row bg-primary">
              <div class="col pt-2 pb-2">
                  <button class="btn btn-success" :disabled="player.userId" @click="onViewConversationRequested"><i class="fas fa-envelope"></i></button>
                  <button class="btn btn-info ml-1" :disabled="player.userId" @click="onViewCompareIntelRequested"><i class="fas fa-chart-line"></i></button>
              </div>
          </div>
      </div>
      <div class="col pr-0 bg-secondary">
          <statistics :player="player"/>
      </div>
  </div>
</div>
</template>

<script>
import Statistics from './Statistics'
import gameHelper from '../../../services/gameHelper'

export default {
  components: {
    'statistics': Statistics
  },
  props: {
    player: Object
  },
  methods: {
    getFriendlyColour (colour) {
      return gameHelper.getFriendlyColour(colour)
    },
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
