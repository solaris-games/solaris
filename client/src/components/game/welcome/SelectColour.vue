<template>
<div>
    <div class="row text-center bg-primary">
        <div class="col">
            <p class="mb-0 mt-2 mb-2">Select a colour and starting location.</p>
        </div>
    </div>

    <div class="row">
      <div class="table-responsive">
        <table class="table table-sm table-striped">
            <tbody>
                <tr v-for="player in players" v-bind:key="player._id">
                    <td :style="{'width': '8px', 'background-color': getFriendlyColour(player.colour.value)}"></td>
                    <td class="col-avatar" :title="player.colour.alias" @click="onOpenPlayerDetailRequested(player)">
                        <img v-if="player.avatar" :src="getAvatarImage(player)">
                        <i v-if="!player.avatar" class="far fa-user ml-2 mr-2 mt-2 mb-2" style="font-size:40px;"></i>
                    </td>
                    <td class="pl-2 pt-3 pb-2">
                        <h5 style="vertical-align: middle;">{{player.alias}}</h5>
                    </td>
                    <td class="fit pl-2 pt-2 pb-2 pr-2">
                        <button class="btn btn-info" @click="panToPlayer(player)"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-success ml-1" @click="onJoinRequested(player)" v-if="player.isEmptySlot">Join</button>
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
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
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e._id)
    },
    panToPlayer (player) {
      gameContainer.map.panToPlayer(this.$store.state.game, player)
    },
    getAvatarImage (player) {
      return require(`../../../assets/avatars/${player.avatar}.png`)
    }
  },

  created () {
    this.sockets.subscribe('gamePlayerJoined', (data) => {
      let player = gameHelper.getPlayerById(this.$store.state.game, data.playerId)

      player.isEmptySlot = false
      player.alias = data.alias
    })

    this.sockets.subscribe('gamePlayerQuit', (data) => {
      let player = this.players.find(p => p._id === data.playerId)

      player.isEmptySlot = true
      player.alias = 'Empty Slot'
    })
  },
  destroyed () {
    this.sockets.unsubscribe('gamePlayerJoined')
    this.sockets.unsubscribe('gamePlayerQuit')
  }
}
</script>

<style scoped>
img {
    height: 55px;
}

.col-avatar {
    width: 55px;
    cursor: pointer;
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
