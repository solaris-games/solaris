<template>
<div class="menu-page container pb-2">
    <menu-title title="Leaderboard" @onCloseRequested="onCloseRequested">
      <button title="View Settings" tag="button" class="btn btn-sm btn-primary" @click="onViewSettingsRequested"><i class="fas fa-cog"></i></button>
    </menu-title>

    <div class="row bg-primary">
        <div class="col">
            <h4 class="text-center mt-2">{{game.settings.general.name}}</h4>
        </div>
    </div>

    <div class="row mb-2" v-if="!game.state.endDate">
        <div class="col text-center pt-2">
            <p class="mb-0 text-warning" v-if="isConquestAllStars">Be the first to capture {{game.state.starsForVictory}} of {{game.state.stars}} stars.</p>
            <p class="mb-0 text-warning" v-if="isConquestHomeStars">Be the first to capture {{game.state.starsForVictory}} of {{game.settings.general.playerLimit}} capital stars.</p>
            <p class="mb-0 text-warning" v-if="isKingOfTheHillMode">Capture and hold the center star to win.</p>
            <p class="mb-0" v-if="game.settings.general.mode === 'battleRoyale'">Battle Royale - {{game.state.stars}} Stars Remaining</p>
            <p class="mb-0" v-if="isKingOfTheHillMode && game.state.ticksToEnd == null"><small>The countdown begins when the center star is captured</small></p>
            <p class="mb-0 text-danger" v-if="isKingOfTheHillMode && game.state.ticksToEnd != null">Countdown - {{game.state.ticksToEnd}} Ticks Remaining</p>
        </div>
    </div>

    <div class="row bg-primary" v-if="!game.state.endDate">
        <div class="col text-center pt-2">
          <p class="mb-2">Galactic Cycle {{$store.state.productionTick}} - Tick {{$store.state.tick}}</p>
          <p class="text-warning" v-if="isDarkModeExtra && getUserPlayer() != null"><small>The leaderboard is based on your scanning range.</small></p>
        </div>
    </div>

    <div class="row bg-secondary" v-if="game.state.startDate && !game.state.endDate">
        <div class="col text-center pt-2 pb-0">
            <p class="pb-0 mb-2">{{timeRemaining}}</p>
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
                      <td class="col-avatar" :title="player.colour.alias + ' ' + player.shape">
                          <player-avatar :player="player" @onClick="onOpenPlayerDetailRequested(player)"/>
                      </td>
                      <td class="pl-2 pt-3 pb-2">
                          <!-- Text styling for defeated players? -->
                          <h5 class="alias-title">
                            {{player.alias}}
                            <span v-if="isKingOfTheHillMode && player.isKingOfTheHill" title="This player is the king of the hill">
                              <i class="fas fa-crown"></i>
                            </span>
                            <span v-if="player.defeated" :title="getPlayerStatus(player)">
                              <i v-if="!player.afk" class="fas fa-skull-crossbones" title="This player has been defeated"></i>
                              <i v-if="player.afk" class="fas fa-user-clock" title="This player is AFK"></i>
                            </span>
                            <span v-if="canReadyToQuit && player.readyToQuit" @click="unconfirmReadyToQuit(player)">
                              <i class="fas fa-check text-warning" title="This player is ready to quit - Ends the game early if all active players are ready to quit"></i>
                            </span>
                          </h5>
                      </td>
                      <td class="fit pt-3 pr-2" v-if="isConquestAllStars || isKingOfTheHillMode">
                        <span class="d-xs-block d-sm-none">
                          <i class="fas fa-star mr-0"></i> {{player.stats.totalStars}}
                        </span>
                        <span class="d-none d-sm-block">
                          {{player.stats.totalStars}} Stars
                        </span> 
                      </td>
                      <td class="fit pt-3 pr-2" v-if="isConquestHomeStars">
                        <span class="d-xs-block d-sm-none">
                          <i class="fas fa-star mr-0"></i> {{player.stats.totalHomeStars}}({{player.stats.totalStars}})
                        </span>
                        <span class="d-none d-sm-block">
                          {{player.stats.totalHomeStars}}({{player.stats.totalStars}}) Stars
                        </span> 
                      </td>
                      <td class="fit pt-2 pb-2 pr-1 text-center" v-if="isTurnBasedGame && canEndTurn">
                        <h5 v-if="player.ready" class="pt-2 pr-2 pl-2" @click="unconfirmReady(player)" :disabled="$isHistoricalMode()">
                          <i class="fas fa-check text-success" title="This player has completed their turn"></i>
                        </h5>
                        <button class="btn btn-success pulse" v-if="isUserPlayer(player) && !player.ready && !player.defeated" @click="confirmReady(player)" :disabled="$isHistoricalMode()" title="End your turn"><i class="fas fa-check"></i></button>
                      </td>
                      <td class="fit pt-2 pb-2 pr-2">
                          <button class="btn btn-info" @click="panToPlayer(player)"><i class="fas fa-eye"></i></button>
                      </td>
                  </tr>
              </tbody>
          </table>
        </div>
    </div>

    <share-link v-if="!game.state.startDate" message="Invite your friends and take on the Galaxy together!"/>
    <share-link v-if="game.state.startDate && !game.state.endDate" message="Share this game with your friends to spectate, no sign-up required!"/>
    <share-link v-if="game.state.endDate" message="Share this game with your friends, no sign-up required!"/>

    <div class="row" v-if="getUserPlayer() != null && !game.state.endDate">
      <div class="col text-right pr-2">
          <modalButton v-if="!game.state.startDate" :disabled="isQuittingGame" modalName="quitGameModal" classText="btn btn-sm btn-danger">
            <i class="fas fa-sign-out-alt"></i> Quit Game
          </modalButton>
          <button v-if="canReadyToQuit && !getUserPlayer().defeated && !getUserPlayer().readyToQuit" @click="confirmReadyToQuit(getUserPlayer())" class="btn btn-sm btn-warning mr-1">
            <i class="fas fa-times"></i> Declare Ready to Quit
          </button>
          <button v-if="canReadyToQuit && !getUserPlayer().defeated && getUserPlayer().readyToQuit" @click="unconfirmReadyToQuit(getUserPlayer())" class="btn btn-sm btn-success mr-1">
            <i class="fas fa-check"></i> Ready to Quit
          </button>
          <modalButton v-if="!isTutorialGame && game.state.startDate && !getUserPlayer().defeated" :disabled="isConcedingDefeat" modalName="concedeDefeatModal" classText="btn btn-sm btn-danger">
            <i class="fas fa-skull-crossbones"></i> Concede Defeat
          </modalButton>
          <modalButton v-if="isTutorialGame && game.state.startDate && !getUserPlayer().defeated" :disabled="isConcedingDefeat" modalName="exitTutorialModal" classText="btn btn-sm btn-danger">
            <i class="fas fa-skull-crossbones"></i> Quit Tutorial
          </modalButton>
      </div>
    </div>

    <!-- Modals -->
    <dialogModal modalName="quitGameModal" titleText="Quit Game" cancelText="No" confirmText="Yes" @onConfirm="quitGame">
      <p>Are you sure you want to quit this game? Your position will be opened again and you will <b>not</b> be able to rejoin.</p>
    </dialogModal>

    <dialogModal modalName="concedeDefeatModal" titleText="Concede Defeat" cancelText="No" confirmText="Yes" @onConfirm="concedeDefeat">
      <p>Are you sure you want to concede defeat in this game?</p>
    </dialogModal>

    <dialogModal modalName="exitTutorialModal" titleText="Quit Tutorial" cancelText="No" confirmText="Yes" @onConfirm="concedeDefeat">
      <p>Are you sure you want to quit the tutorial? All progress will be lost.</p>
    </dialogModal>
</div>
</template>

<script>
import moment from 'moment'
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
import PlayerAvatarVue from '../menu/PlayerAvatar'

export default {
  components: {
    'menu-title': MenuTitle,
    'modalButton': ModalButton,
    'dialogModal': DialogModal,
    'share-link': ShareLinkVue,
    'player-avatar': PlayerAvatarVue
  },

  data () {
    return {
      audio: null,
      players: [],
      timeRemaining: null,
      isQuittingGame: false,
      isConcedingDefeat: false
    }
  },
  mounted () {
    this.players = this.$store.state.game.galaxy.players

    this.recalculateTimeRemaining()

    if (GameHelper.isGameInProgress(this.$store.state.game) || GameHelper.isGamePendingStart(this.$store.state.game)) {
      this.intervalFunction = setInterval(this.recalculateTimeRemaining, 1000)
      this.recalculateTimeRemaining()
    }
  },
  destroyed () {
    clearInterval(this.intervalFunction)
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e._id)
    },
    onViewSettingsRequested (e) {
      this.$emit('onViewSettingsRequested', e)
    },
    panToPlayer (player) {
      gameContainer.map.panToPlayer(this.$store.state.game, player)
      this.onOpenPlayerDetailRequested(player)
    },
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    getFriendlyColour (colour) {
      return gameHelper.getFriendlyColour(colour)
    },
    isUserPlayer (player) {
      let userPlayer = this.getUserPlayer()

      return userPlayer && userPlayer._id === player._id
    },
    recalculateTimeRemaining () {
      if (gameHelper.isRealTimeGame(this.$store.state.game)) {
        this.timeRemaining = `Next tick: ${gameHelper.getCountdownTimeStringByTicks(this.$store.state.game, 1)}`
      } else if (gameHelper.isTurnBasedGame(this.$store.state.game)) {
        this.timeRemaining = `Next turn: ${gameHelper.getCountdownTimeStringForTurnTimeout(this.$store.state.game)}`
      }
    },
    async concedeDefeat () {
      this.isConcedingDefeat = true

      try {
        let response = await gameService.concedeDefeat(this.$store.state.game._id)

        if (response.status === 200) {
          AudioService.quit()

          if (!this.isTutorialGame) {
            this.$toasted.show(`You have conceded defeat, better luck next time.`, { type: 'error' })
          }

          router.push({ name: 'main-menu' })
        }
      } catch (err) {
        console.error(err)
      }

      this.isConcedingDefeat = false
    },
    async quitGame () {
      this.isQuittingGame = true

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

      this.isQuittingGame = false
    },
    async confirmReady (player) {
      if (!await this.$confirm('End turn', 'Are you sure you want to end your turn?')) {
        return
      }
      
      try {
        let response = await gameService.confirmReady(this.$store.state.game._id)

        if (response.status === 200) {
          if (this.isTutorialGame) {
            this.$toasted.show(`You have confirmed your move, please wait while the game processes the tick.`, { type: 'success' })
          } else {
            this.$toasted.show(`You have confirmed your move, once all players are ready the game will progress automatically.`, { type: 'success' })
          }
          

          player.ready = true
        }
      } catch (err) {
        console.error(err)
      }
    },
    async unconfirmReady (player) {
      if (!this.isUserPlayer(player)) {
        return
      }

      try {
        let response = await gameService.unconfirmReady(this.$store.state.game._id)

        if (response.status === 200) {
          player.ready = false
        }
      } catch (err) {
        console.error(err)
      }
    },
    async confirmReadyToQuit (player) {
      if (!this.isUserPlayer(player) || this.$isHistoricalMode()) {
        return
      }
      
      if (!await this.$confirm('Ready to Quit?', 'Are you sure you want declare that you are ready to quit? If all active players declare ready to quit then the game will end early.')) {
        return
      }
      
      try {
        let response = await gameService.confirmReadyToQuit(this.$store.state.game._id)

        if (response.status === 200) {
          this.$toasted.show(`You have confirmed that you are ready to quit.`, { type: 'success' })

          player.readyToQuit = true
        }
      } catch (err) {
        console.error(err)
      }
    },
    async unconfirmReadyToQuit (player) {
      if (!this.isUserPlayer(player) || this.$isHistoricalMode()) {
        return
      }

      try {
        let response = await gameService.unconfirmReadyToQuit(this.$store.state.game._id)

        if (response.status === 200) {
          player.readyToQuit = false
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
      try {
      return require(`../../../assets/avatars/${player.avatar}.png`)
      } catch (err) {
        console.error(err)
        
        return null
      }
    }
  },

  computed: {
    game () {
      return this.$store.state.game
    },
    sortedPlayers () {
      return GameHelper.getSortedLeaderboardPlayerList(this.$store.state.game)
    },
    isTurnBasedGame () {
      return this.$store.state.game.settings.gameTime.gameType === 'turnBased'
    },
    isDarkModeExtra () {
      return gameHelper.isDarkModeExtra(this.$store.state.game)
    },
    isConquestAllStars () {
      return gameHelper.isConquestAllStars(this.$store.state.game)
    },
    isConquestHomeStars () {
      return gameHelper.isConquestHomeStars(this.$store.state.game)
    },
    isKingOfTheHillMode () {
      return gameHelper.isKingOfTheHillMode(this.$store.state.game)
    },
    canEndTurn () {
      return GameHelper.isGameInProgress(this.$store.state.game) || GameHelper.isGamePendingStart(this.$store.state.game)
    },
    isTutorialGame () {
      return GameHelper.isTutorialGame(this.$store.state.game)
    },
    canReadyToQuit () {
      return !GameHelper.isTutorialGame(this.$store.state.game)
        && this.$store.state.game.state.startDate 
        && this.$store.state.game.state.productionTick
    }
  }
}
</script>

<style scoped>
.col-avatar {
  position:absolute;
  width: 59px;
  height: 59px;
  cursor: pointer;
  padding: 0;
}

.alias-title {
  padding-left: 59px;
}

table tr {
  height: 59px;
}

.table-sm td {
  padding: 0;
}

.table td.fit,
.table th.fit {
    white-space: nowrap;
    width: 1%;
}

.fa-check {
  cursor: pointer;
}

@media screen and (max-width: 576px) {
  table tr {
    height: 45px;
  }

  .alias-title {
    padding-left: 45px;
  }

  .col-avatar {
    width: 45px;
  }
}

.pulse {
  animation: blinker 1.5s linear infinite;
}

@keyframes blinker {
  50% {
    opacity: 0.3;
  }
}
</style>
