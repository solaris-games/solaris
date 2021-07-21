<template>
<div v-if="player">
  <div class="row" :style="{'background-image': 'linear-gradient(to left, ' + colour + ', #375a7f 100%)'}">
      <div class="col">
          <h4 class="pt-2">
            <player-icon :playerId="player._id"/>
            {{player.alias}}<i class="fas fa-robot ml-1" v-if="player.defeated" title="AI Controlled"></i>
          </h4>
      </div>
      <div class="col-auto">
        <h4 class="pt-2">
          <span v-if="player.defeated" :title="getPlayerStatus(player)">
            <i v-if="!player.afk" class="fas fa-skull-crossbones" title="Defeated"></i>
            <i v-if="player.afk" class="fas fa-user-clock" title="AFK"></i>
          </span>
          <span class="ml-2" v-if="player.hasDuplicateIP" title="Warning: This player shares the same IP address as another player in this game.">
            <i class="fas fa-exclamation-triangle"></i>
          </span>
        </h4>
      </div>
  </div>
  <player-online-status :player="player"/>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import PlayerIconVue from '../player/PlayerIcon'
import PlayerOnlineStatusVue from './PlayerOnlineStatus'

export default {
  components: {
    'player-icon': PlayerIconVue,
    'player-online-status': PlayerOnlineStatusVue
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
      return GameHelper.getFriendlyColour(colour)
    },  
    getPlayerStatus () {
      return GameHelper.getPlayerStatus(this.player)
    }
  }
}
</script>

<style scoped>

</style>
