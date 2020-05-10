<template>
<div>
    <div class="row text-center bg-primary">
        <div class="col">
            <p class="mb-0 mt-2 mb-2">Select a colour and starting location.</p>
        </div>
    </div>

    <div class="row">
        <table class="table table-sm table-striped">
            <tbody>
                <tr v-for="player in players" v-bind:key="player._id">
                    <td :style="{'width': '8px', 'background-color': getFriendlyColour(player.colour.value)}"></td>
                    <td class="col-avatar" :title="player.colour.alias">
                        <!-- TODO: Prefer images over font awesome icons? -->
                        <i class="far fa-user pl-2 pr-2 pt-2 pb-2" style="font-size:40px;"></i>
                        <!-- <img src=""> -->
                    </td>
                    <td class="pl-2 pt-3 pb-2">
                        <h5 style="vertical-align: middle;">{{player.alias}}</h5>
                    </td>
                    <td class="fit pl-2 pt-2 pb-2 pr-2">
                        <button class="btn btn-info" @click="zoomToPlayer(player)"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-success ml-1" @click="onJoinRequested(player)" v-if="player.isEmptySlot">Join</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
</template>

<script>
import gameContainer from '../../../game/container'
import gameHelper from '../../../services/gameHelper'

export default {
  data () {
      return {
          players: []
      }
  },
  mounted () {
      this.players = this.$store.state.game.galaxy.players
  },

  methods: {
    getFriendlyColour (colour) {
      return gameHelper.getFriendlyColour(colour)
    },
    onJoinRequested (player) {
      this.$emit('onJoinRequested', player._id)
    },
    zoomToPlayer (player) {
      gameContainer.map.zoomToPlayer(this.$store.state.game, player)
    }
  },

  created () {
    this.sockets.listener.subscribe('gamePlayerJoined', (data) => {
      let player = gameHelper.getPlayerById(this.$store.state.game, data.playerId)

      player.isEmptySlot = false
      player.alias = data.alias
    })

    this.sockets.listener.subscribe('gamePlayerQuit', (data) => {
      let player = this.players.find(p => p._id === data.playerId)

      player.isEmptySlot = true
      player.alias = 'Empty Slot'
    })
  },
  destroyed () {
    this.sockets.listener.unsubscribe('gamePlayerJoined')
    this.sockets.listener.unsubscribe('gamePlayerQuit')
  }
}
</script>

<style scoped>
img {
    height: 48px;
    width: 48px;
}

.col-avatar {
    width: 48px;
}

.table-sm td {
    padding: 0;
}

.table td.fit,
.table th.fit {
    white-space: nowrap;
    width: 1%;
}
</style>
