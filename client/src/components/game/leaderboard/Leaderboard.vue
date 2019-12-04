<template>
<div class="container bg-secondary">
    <h3 class="pt-2">Leaderboard</h3>

    <div class="row bg-primary">
        <div class="col">
            <h4 class="text-center mt-2">{{game.settings.general.name}}</h4>
        </div>
    </div>

    <div class="row">
        <div class="col text-center pt-2">
            <p class="mb-0">Be the first to capture {{game.state.starsForVictory}} of {{game.state.stars}} stars.</p>
            <p>Galactic Cycle {{game.state.productionTick}} - Tick {{game.state.tick}}</p>
        </div>
    </div>

    <div class="row">
        <table class="table table-sm table-striped">
            <tbody>
                <!--  v-bind:style="{'opacity':player.defeated ? 0.5: 1}" -->
                <tr v-for="player in game.galaxy.players" :key="player._id">
                    <td :style="{'width': '8px', 'background-color':player.colour.value.replace('0x', '#')}"></td>
                    <td class="col-avatar">
                        <img src="../../../assets/avatars/0.jpg">
                    </td>
                    <td class="pl-2 pt-3 pb-2">
                        <h5>{{player.alias}} <span v-if="player.defeated">(DEFEATED)</span></h5>
                    </td>
                    <td class="fit pt-3 pr-2">
                        <span>{{getPlayerStarCount(player)}} Stars</span>
                    </td>
                    <td class="fit pt-2 pb-2 pr-2">
                        <button class="btn btn-info" @click="zoomToPlayer(player)"><i class="fas fa-eye"></i></button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="row" v-if="getUserPlayer() != null && !getUserPlayer().defeated">
        <div class="col text-right pr-2">
            <button type="button" class="btn btn-danger" data-toggle="modal" data-target="#concedeDefeatModal">
                Concede Defeat
            </button>
        </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="concedeDefeatModal" tabindex="-1" role="dialog" aria-labelledby="concedeDefeatModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="concedeDefeatModalLabel">Concede Defeat</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to concede defeat in this game?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" @click="concedeDefeat">OK</button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import apiService from '../../../services/apiService'
import GameHelper from '../../../services/gameHelper'
import gameContainer from '../../../game/container'

export default {
  props: {
    game: Object
  },
  methods: {
    zoomToPlayer (player) {
      gameContainer.map.zoomToPlayer(this.game, player)
    },
    getUserPlayer () {
        return GameHelper.getUserPlayer(this.game, this.$store.state.userId)
    },
    getPlayerStarCount (player) {
      return this.game.galaxy.stars.filter(s => s.ownedByPlayerId === player._id).length
    },
    async concedeDefeat () {
      try {
        let response = await apiService.concedeDefeat(this.game._id)

        if (response.status === 200) {
          alert('Defeated')
        }
      } catch (err) {
        console.error(err)
      }
    }
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
