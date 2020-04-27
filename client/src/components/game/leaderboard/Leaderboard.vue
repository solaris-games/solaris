<template>
<div class="container pb-2">
    <menu-title title="Leaderboard" @onCloseRequested="onCloseRequested"/>

    <div class="row bg-primary">
        <div class="col">
            <h4 class="text-center mt-2">{{game.settings.general.name}}</h4>
        </div>
    </div>

    <div class="row" v-if="!game.state.endDate">
        <div class="col text-center pt-2">
            <p class="mb-0">Be the first to capture {{game.state.starsForVictory}} of {{game.state.stars}} stars.</p>
            <p>Galactic Cycle {{game.state.productionTick}} - Tick {{game.state.tick}}</p>
        </div>
    </div>

    <div class="row bg-success" v-if="game.state.endDate">
        <div class="col text-center pt-2">
            <h3>Game Over!</h3>
            <p>Congratulations to the winner!</p>
        </div>
    </div>

    <div class="row">
        <table class="table table-sm table-striped">
            <tbody>
                <!--  v-bind:style="{'opacity':player.defeated ? 0.5: 1}" -->
                <!-- TODO: Sort this list by number of stars owned -->
                <tr v-for="player in getSortedLeaderboardPlayerList()" :key="player._id">
                    <td :style="{'width': '8px', 'background-color': getFriendlyColour(player.colour.value)}"></td>
                    <td class="col-avatar">
                        <!-- TODO: Prefer images over font awesome icons? -->
                        <i class="far fa-user pl-2 pr-2 pt-2 pb-2" style="font-size:40px;"></i>
                        <!-- <img src=""> -->
                    </td>
                    <td class="pl-2 pt-3 pb-2">
                        <h5>{{player.alias}} <span v-if="player.defeated">(DEFEATED)</span></h5>
                    </td>
                    <td class="fit pt-3 pr-2">
                        <span>{{player.stats.totalStars}} Stars</span>
                    </td>
                    <td class="fit pt-2 pb-2 pr-2">
                        <button class="btn btn-info" @click="zoomToPlayer(player)"><i class="fas fa-eye"></i></button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="row" v-if="getUserPlayer() != null && !game.state.endDate">
        <div class="col text-right pr-2">
            <modalButton v-if="!game.state.startDate" modalName="quitGameModal" classText="btn btn-danger">Quit Game</modalButton>
            <modalButton v-if="game.state.startDate && !getUserPlayer().defeated" modalName="concedeDefeatModal" classText="btn btn-danger">Concede Defeat</modalButton>
        </div>
    </div>

    <!-- Modals -->
    <dialogModal modalName="quitGameModal" titleText="Quit Game" cancelText="No" confirmText="Yes" @onConfirm="quitGame">
      <p>Are you sure you want to quit this game? Your position will be opened again and you will <b>not</b> be able to rejoin.</p>
    </dialogModal>

    <dialogModal modalName="concedeDefeatModal" titleText="Concede Defeat" cancelText="No" confirmText="Yes" @onConfirm="concedeDefeat">
      <p>Are you sure you want to concede defeat in this game?</p>
    </dialogModal>
</div>
</template>

<script>
import router from '../../../router'
import gameService from '../../../services/api/game'
import GameHelper from '../../../services/gameHelper'
import gameContainer from '../../../game/container'
import ModalButton from '../../modal/ModalButton'
import DialogModal from '../../modal/DialogModal'
import gameHelper from '../../../services/gameHelper'
import MenuTitle from '../MenuTitle'

export default {
  props: {
    game: Object
  },
  components: {
    'menu-title': MenuTitle,
    'modalButton': ModalButton,
    'dialogModal': DialogModal
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    zoomToPlayer (player) {
      gameContainer.map.zoomToPlayer(this.game, player)
    },
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.game)
    },
    getFriendlyColour (colour) {
      return gameHelper.getFriendlyColour(colour)
    },
    getSortedLeaderboardPlayerList () {
      // Sort by total number of stars, then by total ships, then by total carriers.
      return this.game.galaxy.players
        .sort((a, b) => b.stats.totalStars - a.stats.totalStars)
        .sort((a, b) => b.stats.totalShips - a.stats.totalShips)
        .sort((a, b) => b.stats.totalCarriers - a.stats.totalCarriers)
    },
    async concedeDefeat () {
      try {
        let response = await gameService.concedeDefeat(this.game._id)

        if (response.status === 200) {
            router.push({ name: 'main-menu' })
        }
      } catch (err) {
        console.error(err)
      }
    },
    async quitGame () {
      try {
        let response = await gameService.quitGame(this.game._id)

        if (response.status === 200) {
            router.push({ name: 'main-menu' })
        }
      } catch (err) {
        console.error(err)
      }
    },
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
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
