<template>
  <div v-if="player" class="row" :style="{'background-image': 'linear-gradient(to left, ' + colour + ', #375a7f 100%)'}">
      <div class="col">
          <h4 class="pt-2">
            <player-icon :playerId="player._id"/>
            {{player.alias}} 
            <!-- <span v-if="player.userId">(You)</span> -->
            <span v-if="player.defeated" :title="getPlayerStatus(player)">
              <i class="fas fa-skull-crossbones"></i>
            </span>
          </h4>
      </div>
  </div>
</template>

<script>
import gameHelper from '../../../services/gameHelper'
import PlayerIconVue from '../player/PlayerIcon'

export default {
  components: {
    'player-icon': PlayerIconVue
  },
  props: {
    player: Object
  },
  data () {
    return {
      colour: ''
    }
  },
  mounted () {
    this.colour = this.getFriendlyColour(this.player.colour.value)
  },
  methods: {
    getFriendlyColour (colour) {
      return gameHelper.getFriendlyColour(colour)
    },  
    getPlayerStatus () {
      return gameHelper.getPlayerStatus(this.player)
    }
  }
}
</script>

<style scoped>

</style>
