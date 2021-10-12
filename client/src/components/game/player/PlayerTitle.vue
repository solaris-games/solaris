<template>
<div v-if="player">
  <div class="row" :style="{'background-image': 'linear-gradient(to left, ' + colour + ', #375a7f 100%)'}">
      <div class="col">
          <h4 class="pt-2">
            <player-icon :playerId="player._id"/>
            {{player.alias}}
          </h4>
      </div>
      <div class="col-auto">
        <h4 class="pt-2">
          <player-diplomatic-status-icon v-if="isFormalAlliancesEnabled" :toPlayerId="player._id" class="ml-2"/>
          <i v-if="player.hasFilledAfkSlot && !player.afk" class="fas fa-user-friends ml-2" title="This player has filled an AFK slot and will be awarded 1.5x additional rank (minimum 1) when the game ends"></i>
          <span v-if="player.defeated" :title="getPlayerStatus(player)">
            <i class="fas fa-robot ml-2" v-if="player.defeated" title="AI Controlled"></i>
            <i v-if="!player.afk" class="fas fa-skull-crossbones ml-2" title="Defeated"></i>
            <i v-if="player.afk" class="fas fa-user-clock ml-2" title="AFK"></i>
          </span>
          <span class="ml-2" v-if="player.hasDuplicateIP" title="Warning: This player shares the same IP address as another player in this game.">
            <i class="fas fa-exclamation-triangle"></i>
          </span>
        </h4>
      </div>
  </div>
  <player-online-status :player="player"/>
  <player-missed-turns :player="player"/>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import PlayerIconVue from '../player/PlayerIcon'
import PlayerOnlineStatusVue from './PlayerOnlineStatus'
import PlayerMissedTurnsVue from './PlayerMissedTurns'
import PlayerDiplomaticStatusIcon from './PlayerDiplomaticStatusIcon'

export default {
  components: {
    'player-icon': PlayerIconVue,
    'player-online-status': PlayerOnlineStatusVue,
    'player-missed-turns': PlayerMissedTurnsVue,
    'player-diplomatic-status-icon': PlayerDiplomaticStatusIcon
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
  },
  computed: {
    isFormalAlliancesEnabled () {
      return this.$store.state.game.settings.player.alliances === 'enabled'
    }
  }
}
</script>

<style scoped>

</style>
