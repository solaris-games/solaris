<template>
  <div class="menu-page container pb-2">
    <menu-title title="Leaderboard" @onCloseRequested="onCloseRequested">
      <button title="View Settings" tag="button" class="btn btn-sm btn-outline-primary"
              @click="onViewSettingsRequested"><i class="fas fa-cog"></i></button>
    </menu-title>

    <div class="row">
      <div class="col">
        <h4 class="text-center mt-2">{{ game.settings.general.name }}</h4>
      </div>
    </div>

    <div class="row bg-info" v-if="game.settings.general.flux" title="This Game's Flux">
      <div class="col text-center">
        <!-- <p class="mt-2 mb-2"><small><i class="fas fa-dice-d20 me-1"></i><strong>{{game.settings.general.flux.name}}</strong> - {{game.settings.general.flux.description}} <help-tooltip v-if="game.settings.general.flux.tooltip" :tooltip="game.settings.general.flux.tooltip"/></small></p> -->
        <p class="mt-2 mb-2"><small><i class="fas fa-dice-d20 me-1"></i>{{ game.settings.general.flux.description }}
          <help-tooltip v-if="game.settings.general.flux.tooltip" :tooltip="game.settings.general.flux.tooltip"/>
        </small></p>
      </div>
    </div>

    <div class="row mb-2" v-if="!game.state.endDate">
      <div class="col text-center pt-2">
        <p class="mb-0 text-warning" v-if="isConquestAllStars">Be the first to capture {{ game.state.starsForVictory }}
          of {{ game.state.stars }} stars</p>
        <p class="mb-0 text-warning" v-if="isConquestHomeStars">Be the first to capture {{ game.state.starsForVictory }}
          of {{ game.settings.general.playerLimit }} capital stars</p>
        <p class="mb-0 text-warning" v-if="isTeamConquest && isStarCountWin">Be the first team to capture
          {{ game.state.starsForVictory }} of {{ game.state.stars }} stars</p>
        <p class="mb-0 text-warning" v-if="isTeamConquest && isHomeStarCountWinCondition">Be the first team to capture
          {{ game.state.starsForVictory }} of {{ game.settings.general.playerLimit }} capital stars</p>
        <p class="mb-0 text-warning" v-if="isKingOfTheHillMode">Capture and hold the center star to win</p>
        <p class="mb-0" v-if="game.settings.general.mode === 'battleRoyale'">Battle Royale - {{ game.state.stars }}
          Stars Remaining</p>
        <p class="mb-0" v-if="isKingOfTheHillMode && game.state.ticksToEnd == null"><small>The countdown begins when the
          center star is captured</small></p>
        <p class="mb-0 text-danger" v-if="game.state.ticksToEnd != null">Countdown - {{ game.state.ticksToEnd }}
          Tick<span v-if="game.state.ticksToEnd !== 1">s</span> Remaining
          <help-tooltip v-if="isKingOfTheHillMode"
                        tooltip="The countdown will reset to 1 cycle if the center star is captured with less than 1 cycle left"/>
        </p>
      </div>
    </div>

    <div class="row bg-dark" v-if="!game.state.endDate">
      <div class="col text-center pt-2">
        <p class="mb-2">Galactic Cycle {{ $store.state.productionTick }} - Tick {{ $store.state.tick }}</p>
        <p class="text-warning" v-if="isDarkModeExtra && getUserPlayer() != null"><small>The leaderboard is based on
          your scanning range.</small></p>
      </div>
    </div>

    <div class="row" v-if="game.state.startDate && !game.state.endDate">
      <div class="col text-center pt-2 pb-0">
        <p class="pb-0 mb-2">{{ timeRemaining }}</p>
      </div>
    </div>

    <div class="row" v-if="game.state.readyToQuitCount">
      <div class="col text-center pt-2">
        <p>{{game.state.readyToQuitCount}} of {{game.state.players}} active players are ready to quit.</p>
      </div>
    </div>

    <div class="row bg-success" v-if="game.state.endDate">
      <div class="col text-center pt-2">
        <h3>Game Over</h3>
        <p v-if="!isTeamGame">The winner is <b>{{ getWinnerAlias() }}</b>!</p>
        <p v-if="isTeamGame">The winning team is <b>{{ getWinningTeamName() }}</b></p>
      </div>
    </div>

    <div v-if="isTeamConquest">
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link" :class="{'active':activeTab=== 'team'}" data-bs-toggle="tab" href="#team">Team</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{'active':activeTab=== 'player'}" data-bs-toggle="tab" href="#player">Player</a>
        </li>
      </ul>

      <div class="tab-content pt-2 pb-2">
        <div class="tab-pane fade" :class="{'show active':activeTab=== 'team'}" id="team">
          <team-leaderboard @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
        </div>
        <div class="tab-pane fade" :class="{'show active':activeTab=== 'player'}" id="player">
          <player-leaderboard @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
        </div>
      </div>
    </div>

    <player-leaderboard v-if="!isTeamConquest" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>

    <new-player-message/>

    <share-link v-if="!game.state.startDate" message="Invite your friends and take on the Galaxy together!"/>
    <share-link v-if="game.state.startDate && !game.state.endDate"
                message="Share this game with your friends to spectate, no sign-up required!"/>
    <share-link v-if="game.state.endDate" message="Share this game with your friends, no sign-up required!"/>

    <div class="row" v-if="getUserPlayer() != null && !game.state.endDate">
      <div class="col text-end pe-2">
        <modalButton v-if="!game.state.startDate" :disabled="isQuittingGame" modalName="quitGameModal"
                     classText="btn btn-sm btn-danger">
          <i class="fas fa-sign-out-alt"></i> Quit Game
        </modalButton>
        <button v-if="canReadyToQuit && !getUserPlayer().defeated && !getUserPlayer().readyToQuit"
                @click="confirmReadyToQuit(getUserPlayer())" class="btn btn-sm btn-outline-warning me-1">
          <i class="fas fa-times"></i> Declare Ready to Quit
        </button>
        <button v-if="canReadyToQuit && !getUserPlayer().defeated && getUserPlayer().readyToQuit"
                @click="unconfirmReadyToQuit(getUserPlayer())" class="btn btn-sm btn-success me-1">
          <i class="fas fa-check"></i> Ready to Quit
        </button>
        <concede-defeat-button/>
      </div>
    </div>

    <!-- Modals -->
    <dialogModal modalName="quitGameModal" titleText="Quit Game" cancelText="No" confirmText="Yes"
                 @onConfirm="quitGame">
      <p>Are you sure you want to quit this game? Your position will be opened again and you will <b>not</b> be able to
        rejoin.</p>
    </dialogModal>
  </div>
</template>

<script>
import router from '../../../../router'
import gameService from '../../../../services/api/game'
import ModalButton from '../../../components/modal/ModalButton.vue'
import DialogModal from '../../../components/modal/DialogModal.vue'
import GameHelper from '../../../../services/gameHelper'
import MenuTitle from '../MenuTitle.vue'
import AudioService from '../../../../game/audio'
import NewPlayerMessageVue from '../welcome/NewPlayerMessage.vue'
import ShareLinkVue from '../welcome/ShareLink.vue'
import HelpTooltip from '../../../components/HelpTooltip.vue'
import ConcedeDefeatButton from './ConcedeDefeatButton.vue'
import PlayerLeaderboard from './PlayerLeaderboard.vue';
import TeamLeaderboard from './TeamLeaderboard.vue';

export default {
  components: {
    'team-leaderboard': TeamLeaderboard,
    'player-leaderboard': PlayerLeaderboard,
    'menu-title': MenuTitle,
    'modalButton': ModalButton,
    'dialogModal': DialogModal,
    'new-player-message': NewPlayerMessageVue,
    'share-link': ShareLinkVue,
    'help-tooltip': HelpTooltip,
    'concede-defeat-button': ConcedeDefeatButton
  },

  data() {
    return {
      activeTab: null,
      audio: null,
      players: [],
      timeRemaining: null,
      isQuittingGame: false
    }
  },
  mounted() {
    this.activeTab = this.isTeamConquest ? 'team' : 'player'

    this.players = this.$store.state.game.galaxy.players

    this.recalculateTimeRemaining()

    if (GameHelper.isGameInProgress(this.$store.state.game) || GameHelper.isGamePendingStart(this.$store.state.game)) {
      this.intervalFunction = setInterval(this.recalculateTimeRemaining, 250)
      this.recalculateTimeRemaining()
    }
  },
  unmounted() {
    clearInterval(this.intervalFunction)
  },
  methods: {
    onCloseRequested(e) {
      this.$emit('onCloseRequested', e)
    },
    onOpenPlayerDetailRequested(e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    },
    onViewSettingsRequested(e) {
      this.$emit('onViewSettingsRequested', e)
    },
    getUserPlayer() {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    isUserPlayer(player) {
      let userPlayer = this.getUserPlayer()

      return userPlayer && userPlayer._id === player._id
    },
    recalculateTimeRemaining() {
      if (GameHelper.isRealTimeGame(this.$store.state.game)) {
        this.timeRemaining = `Next tick: ${GameHelper.getCountdownTimeStringByTicks(this.$store.state.game, 1)}`
      } else if (GameHelper.isTurnBasedGame(this.$store.state.game)) {
        this.timeRemaining = `Next turn: ${GameHelper.getCountdownTimeStringForTurnTimeout(this.$store.state.game)}`
      }
    },
    async quitGame() {
      this.isQuittingGame = true

      try {
        let response = await gameService.quitGame(this.$store.state.game._id)

        if (response.status === 200) {
          AudioService.quit()
          this.$toast.error(`You have quit ${this.$store.state.game.settings.general.name}.`)
          router.push({name: 'main-menu'})
        }
      } catch (err) {
        console.error(err)
      }

      this.isQuittingGame = false
    },
    async confirmReady (player) {
      if (!await this.$confirm('End Turn', 'Are you sure you want to end your turn?')) {
        return
      }

      try {
        let response = await gameService.confirmReady(this.$store.state.game._id)

        if (response.status === 200) {
          if (this.isTutorialGame) {
            this.$toast.success(`You have confirmed your move, please wait while the game processes the tick.`)
          } else {
            this.$toast.success(`You have confirmed your move, once all players are ready the game will progress automatically.`)
          }

          player.ready = true
        }
      } catch (err) {
        console.error(err)
      }
    },
    async confirmReadyToCycle (player) {
      if (!await this.$confirm('End Cycle', 'Are you sure you want to end your turn up to the end of the current galactic cycle?')) {
        return
      }

      try {
        let response = await gameService.confirmReadyToCycle(this.$store.state.game._id)

        if (response.status === 200) {
          if (this.isTutorialGame) {
            this.$toast.success(`You have confirmed your move, please wait while the game processes the tick.`)
          } else {
            this.$toast.success(`You have confirmed your move, once all players are ready the game will progress automatically.`)
          }

          player.ready = true
          player.readyToCycle = true
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
          player.readyToCycle = false
        }
      } catch (err) {
        console.error(err)
      }
    },
    async confirmReadyToQuit (player) {
      if (!this.isUserPlayer(player) || this.$isHistoricalMode()) {
        return
      }

      let rtqFractionMessage = '';
      if (this.$store.state.game.settings.general.readyToQuitFraction) {
        const percent = this.$store.state.game.settings.general.readyToQuitFraction * 100;
        rtqFractionMessage = ` (or ${percent}% by star count out of all stars)`;
      }

      if (!await this.$confirm('Ready to Quit?', `Are you sure you want declare that you are ready to quit? If all active players${rtqFractionMessage} declare ready to quit then the game will end early.`)) {
        return
      }

      try {
        let response = await gameService.confirmReadyToQuit(this.$store.state.game._id)

        if (response.status === 200) {
          this.$toast.success(`You have confirmed that you are ready to quit.`)

          player.readyToQuit = true
        }
      } catch (err) {
        console.error(err)
      }
    },
    async unconfirmReadyToQuit(player) {
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
    getWinnerAlias() {
      let winnerPlayer = GameHelper.getPlayerById(this.$store.state.game, this.$store.state.game.state.winner)

      return winnerPlayer.alias
    },
    getWinningTeam () {
      return GameHelper.getTeamById(this.$store.state.game, this.$store.state.game.state.winningTeam)
    },
    getWinningTeamName () {
      return this.getWinningTeam().name
    },
    getAvatarImage (player) {
      try {
      return new URL(`../../../../assets/avatars/${player.avatar}`, import.meta.url).href
      } catch (err) {
        console.error(err)

        return null
      }
    }
  },

  computed: {
    game() {
      return this.$store.state.game
    },
    isTurnBasedGame() {
      return this.$store.state.game.settings.gameTime.gameType === 'turnBased'
    },
    isDarkModeExtra() {
      return GameHelper.isDarkModeExtra(this.$store.state.game)
    },
    isConquestAllStars() {
      return GameHelper.isConquestAllStars(this.$store.state.game)
    },
    isConquestHomeStars() {
      return GameHelper.isConquestHomeStars(this.$store.state.game)
    },
    isKingOfTheHillMode() {
      return GameHelper.isKingOfTheHillMode(this.$store.state.game)
    },
    isTeamConquest() {
      return GameHelper.isTeamConquest(this.$store.state.game)
    },
    isStarCountWin() {
      return GameHelper.isWinConditionStarCount(this.$store.state.game)
    },
    isHomeStarCountWinCondition() {
      return GameHelper.isWinConditionHomeStars(this.$store.state.game)
    },
    canReadyToQuit() {
      return this.$store.state.game.settings.general.readyToQuit === 'enabled'
        && this.$store.state.game.state.startDate
        && this.$store.state.game.state.productionTick
    },
    isTeamGame () {
      return GameHelper.isTeamConquest(this.$store.state.game)
    },
  }
}
</script>

<style scoped>
</style>
