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
            <h3>Game Over</h3>
            <p>The winner is <b>{{getWinnerAlias()}}</b>!</p>
        </div>
    </div>

    <div class="row">
        <div class="table-responsive">
          <table class="table table-sm table-striped">
              <tbody>
                  <!--  v-bind:style="{'opacity':player.defeated ? 0.5: 1}" -->
                  <tr v-for="player in sortedPlayers" :key="player._id">
                      <td :style="{'width': '8px', 'background-color': getFriendlyColour(player.colour.value)}"></td>
                      <td class="col-avatar" :title="player.colour.alias" @click="onOpenPlayerDetailRequested(player)">
                          <img v-if="player.avatar" :src="getAvatarImage(player)">
                          <i v-if="!player.avatar" class="far fa-user ml-2 mr-2 mt-2 mb-2" style="font-size:40px;"></i>
                      </td>
                      <td class="pl-2 pt-3 pb-2">
                          <!-- Text styling for defeated players? -->
                          <h5>{{player.alias}}
                            <span v-if="player.defeated">({{getPlayerStatus(player)}})</span>
                          </h5>
                      </td>
                      <td class="fit pt-3 pr-2">
                          <span>{{player.stats.totalStars}} Stars</span>
                      </td>
                      <td class="fit pt-2 pb-2 pr-2">
                          <button class="btn btn-info" @click="panToPlayer(player)"><i class="fas fa-eye"></i></button>
                      </td>
                  </tr>
              </tbody>
          </table>
        </div>
    </div>

    <share-link v-if="!game.state.startDate"/>

    <div class="row" v-if="getUserPlayer() != null && !game.state.endDate">
      <div class="col">
        <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-primary"><i class="fas fa-cog"></i> View Settings</router-link>
      </div>
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
import AudioService from '../../../game/audio'
import ShareLinkVue from '../welcome/ShareLink'
import { DEG_TO_RAD } from 'pixi.js'

export default {
  components: {
    'menu-title': MenuTitle,
    'modalButton': ModalButton,
    'dialogModal': DialogModal,
    'share-link': ShareLinkVue
  },

  data () {
    return {
      players: [],
      sortedPlayers: []
    }
  },
  mounted () {
    this.players = this.$store.state.game.galaxy.players
    this.sortedPlayers = this.getSortedLeaderboardPlayerList()
  },

  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e._id)
    },
    panToPlayer (player) {
      gameContainer.map.panToPlayer(this.$store.state.game, player)
    },
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    getFriendlyColour (colour) {
      return gameHelper.getFriendlyColour(colour)
    },
    getSortedLeaderboardPlayerList () {
      // Sort by total number of stars, then by total ships, then by total carriers.
      return this.players
        .sort((a, b) => {
          // Sort by total stars descending
          if (a.stats.totalStars > b.stats.totalStars) return -1
          if (a.stats.totalStars < b.stats.totalStars) return 1

          // Then by total ships descending
          if (a.stats.totalShips > b.stats.totalShips) return -1
          if (a.stats.totalShips < b.stats.totalShips) return 1

          // Then by total carriers descending
          if (a.stats.totalCarriers > b.stats.totalCarriers) return -1
          if (a.stats.totalCarriers < b.stats.totalCarriers) return 1

          // Then by defeated descending
          return (a.defeated === b.defeated) ? 0 : a.defeated ? 1 : -1
        })
    },
    async concedeDefeat () {
      try {
        let response = await gameService.concedeDefeat(this.$store.state.game._id)

        if (response.status === 200) {
          AudioService.quit()
          this.$toasted.show(`You have conceded defeat, better luck next time.`, { type: 'error' })
          router.push({ name: 'main-menu' })
        }
      } catch (err) {
        console.error(err)
      }
    },
    async quitGame () {
      try {
        let response = await gameService.quitGame(this.$store.state.game._id)

        if (response.status === 200) {
          AudioService.quit()
          this.$toasted.show(`You have quit ${this.$store.state.game.settings.general.name}.`, { type: 'error' })
          router.push({ name: 'main-menu' })
        }
      } catch (err) {
        console.error(err)
      }
    },
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    getWinnerAlias () {
      let winnerPlayer = GameHelper.getPlayerById(this.$store.state.game, this.$store.state.game.state.winner)

      return winnerPlayer.alias
    },
    getPlayerStatus (player) {
      return GameHelper.getPlayerStatus(player)
    },
    getAvatarImage (player) {
      return require(`../../../assets/avatars/${player.avatar}.png`)
    }
  },

  created () {
    this.sockets.subscribe('gamePlayerJoined', (data) => {
      let player = this.players.find(p => p._id === data.playerId)

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
  },

  computed: {
    game () {
      return this.$store.state.game
    }
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
