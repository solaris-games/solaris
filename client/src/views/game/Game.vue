<template>
  <div>
    <logo v-if="!hasGame"></logo>

    <loading-spinner :loading="!hasGame"/>

    <div v-if="hasGame">
        <span class="d-none">{{ gameId }}</span>

        <game-container @onStarClicked="onStarClicked"
                    @onStarRightClicked="onStarRightClicked"
                    @onCarrierClicked="onCarrierClicked"
                    @onCarrierRightClicked="onCarrierRightClicked"
                    @onObjectsClicked="onObjectsClicked"/>

        <main-bar @onPlayerSelected="onPlayerSelected"
                  @onReloadGameRequested="reloadGame"/>

        <chat @onOpenPlayerDetailRequested="onPlayerSelected"/>
    </div>
  </div>
</template>

<script>
import LogoVue from '../components/Logo'
import LoadingSpinnerVue from '../components/LoadingSpinner'
import GameContainer from './components/GameContainer.vue'
import MENU_STATES from '../../services/data/menuStates'
import MainBar from './components/menu/MainBar.vue'
import Chat from './components/inbox/Chat.vue'
import GameApiService from '../../services/api/game'
import UserApiService from '../../services/api/user'
import GameHelper from '../../services/gameHelper'
import AudioService from '../../game/audio'
import moment from 'moment'
import gameHelper from '../../services/gameHelper'
import authService from '../../services/api/auth'

export default {
  components: {
    'logo': LogoVue,
    'loading-spinner': LoadingSpinnerVue,
    'game-container': GameContainer,
    'main-bar': MainBar,
    'chat': Chat
  },
  data () {
    return {
      audio: null,
      MENU_STATES: MENU_STATES,
      polling: null,
      // We use this to track whether we are making a request to the API to get the next tick.
      // It is used to prevent spamming the API if the app gets suspended and is re-opened after a very long time.
      ticking: false
    }
  },
  async created () {
    AudioService.loadStore(this.$store)

    this.$store.commit('clearGame')

    await this.attemptLogin()
    await this.reloadSettings()
    await this.reloadGame()

    this.subscribeToSockets()

    // AudioService.download()

    let player = GameHelper.getUserPlayer(this.$store.state.game)

    let socketData = {
      gameId: this.$store.state.game._id,
      userId: this.$store.state.userId
    }

    if (player) {
      socketData.playerId = player._id
    }

    this.$socket.emit('gameRoomJoined', socketData)

    // If the user is in the game then display the leaderboard.
    // Otherwise show the welcome screen if there are empty slots.
    let userPlayer = this.getUserPlayer()
    
    if (userPlayer && !userPlayer.defeated) {
      if (GameHelper.isTutorialGame(this.$store.state.game)) {
        this.$store.commit('setMenuState', { state: MENU_STATES.TUTORIAL })
      } else {
        this.$store.commit('setMenuState', { state: MENU_STATES.LEADERBOARD })
      }
    } else {
      if (this.$store.state.userId && GameHelper.gameHasOpenSlots(this.$store.state.game)) {
        this.$store.commit('setMenuState', { state: MENU_STATES.WELCOME })
      } else {
        this.$store.commit('setMenuState', { state: MENU_STATES.LEADERBOARD }) // Assume the user is spectating.
      }
    }

    let reloadGameCheckInterval = 1000 // 1 second

    this.polling = setInterval(this.reloadGameCheck, reloadGameCheckInterval)

    this.$store.dispatch('loadSpecialistData');
  },
  beforeDestroy () {
    clearInterval(this.polling)
  },
  destroyed () {
    this.unsubscribeToSockets()
    
    let socketData = {
      gameId: this.$store.state.game._id,
      userId: this.$store.state.userId
    }

    let player = GameHelper.getUserPlayer(this.$store.state.game)

    if (player) {
      socketData.playerId = player._id
    }
    
    this.$socket.emit('gameRoomLeft', socketData)

    document.title = 'Solaris'
  },
  methods: {
    async attemptLogin () {
      if (this.$store.state.userId) {
        return;
      }
      
      try {
        let response = await authService.verify()

        if (response.status === 200) {
          if (response.data._id) {
            this.$store.commit('setUserId', response.data._id)
            this.$store.commit('setUsername', response.data.username)
            this.$store.commit('setRoles', response.data.roles)
            this.$store.commit('setUserCredits', response.data.credits)
          }
        }
      } catch (err) {
        console.error(err)
      }
    },
    async reloadGame () {
      // if (this.$isHistoricalMode()) { // Do not reload if in historical mode
      //   return
      // }

      try {
        let galaxyResponse = await GameApiService.getGameGalaxy(this.$route.query.id)

        // Make sure the player is still in the current game, they may have quickly
        // switched to another game.
        if (this.$route.query.id === galaxyResponse.data._id) {
          this.$store.commit('setGame', galaxyResponse.data) // Persist to storage
          this.$store.commit('setTick', galaxyResponse.data.state.tick)
          this.$store.commit('setProductionTick', galaxyResponse.data.state.productionTick)

          document.title = galaxyResponse.data.settings.general.name + ' - Solaris'
        }
      } catch (err) {
        console.error(err)
      }
    },
    async reloadSettings () {
      try {
        let response = await UserApiService.getGameSettings()

        if (response.status === 200) {
          this.$store.commit('setSettings', response.data) // Persist to storage
        }
      } catch (err) {
        console.error(err)
      }
    },
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },

    // MENU

    resetMenuState () {
      this.$store.commit('clearMenuState')
    },
    onPlayerSelected (e) {
      this.$store.commit('setMenuState', {
        state: MENU_STATES.PLAYER,
        args: e
      })

      this.$emit('onPlayerSelected', e)
    },
    onStarClicked (e) {
      this.$store.commit('setMenuState', {
        state: MENU_STATES.STAR_DETAIL,
        args: e
      })

      AudioService.click()
    },
    onStarRightClicked (e) {
      let star = GameHelper.getStarById(this.$store.state.game, e)
      let owningPlayer = GameHelper.getStarOwningPlayer(this.$store.state.game, star)
      
      if (owningPlayer) {
        this.onPlayerSelected(owningPlayer._id)
      }

      AudioService.click()
    },
    onCarrierClicked (e) {
      this.$store.commit('setMenuState', {
        state: MENU_STATES.CARRIER_DETAIL,
        args: e
      })

      AudioService.click()
    },
    onCarrierRightClicked (e) {
      let carrier = GameHelper.getCarrierById(this.$store.state.game, e)
      let owningPlayer = GameHelper.getCarrierOwningPlayer(this.$store.state.game, carrier)
      
      if (owningPlayer) {
        this.onPlayerSelected(owningPlayer._id)
      }

      AudioService.click()
    },
    onObjectsClicked (e) {
      this.$store.commit('setMenuState', {
        state: MENU_STATES.MAP_OBJECT_SELECTOR,
        args: e
      })

      AudioService.open()
    },

    // --------------------
    // Sockets
    subscribeToSockets () {
      // TODO: Move all component subscriptions into the components' socket object.
      this.sockets.subscribe('gameStarted', (data) => this.onGameStarted(data))
      this.sockets.subscribe('gamePlayerJoined', (data) => this.$store.commit('gamePlayerJoined', data))
      this.sockets.subscribe('gamePlayerQuit', (data) => this.$store.commit('gamePlayerQuit', data))
      this.sockets.subscribe('gamePlayerReady', (data) => this.$store.commit('gamePlayerReady', data))
      this.sockets.subscribe('gamePlayerNotReady', (data) => this.$store.commit('gamePlayerNotReady', data))
      this.sockets.subscribe('gamePlayerReadyToQuit', (data) => this.$store.commit('gamePlayerReadyToQuit', data))
      this.sockets.subscribe('gamePlayerNotReadyToQuit', (data) => this.$store.commit('gamePlayerNotReadyToQuit', data))
      this.sockets.subscribe('playerDebtSettled', (data) => this.$store.commit('playerDebtSettled', data))
      this.sockets.subscribe('gameMessageSent', (data) => this.onMessageReceived(data))

      if (!GameHelper.isHiddenPlayerOnlineStatus(this.$store.state.game)) {
        this.sockets.subscribe('gamePlayerRoomJoined', (data) => this.onGamePlayerRoomJoined(data))
        this.sockets.subscribe('gamePlayerRoomLeft', (data) => this.onGamePlayerRoomLeft(data))
      }
    },
    unsubscribeToSockets () {
      this.sockets.unsubscribe('gameStarted')
      this.sockets.unsubscribe('gamePlayerJoined')
      this.sockets.unsubscribe('gamePlayerQuit')
      this.sockets.unsubscribe('gamePlayerReady')
      this.sockets.unsubscribe('gamePlayerNotReady')
      this.sockets.unsubscribe('gamePlayerReadyToQuit')
      this.sockets.unsubscribe('gamePlayerNotReadyToQuit')
      this.sockets.unsubscribe('playerDebtSettled')
      this.sockets.unsubscribe('gameMessageSent')
    },
    onMessageReceived (e) {
      if (window.innerWidth >= 992) { // Don't do this if the window is too large as it gets handled elsewhere
        return
      }

      let conversationId = e.conversationId

      // Show a toast only if the user isn't already in the conversation.
      if (this.menuState === MENU_STATES.CONVERSATION && this.menuArguments === conversationId) {
        return
      }

      let fromPlayer = GameHelper.getPlayerById(this.$store.state.game, e.fromPlayerId)

      this.$toasted.show(`New message from ${fromPlayer.alias}.`, {
        duration: null,
        type: 'info',
        duration: 10000,
        action: [
          {
            text: 'Dismiss',
            onClick: (e, toastObject) => {
              toastObject.goAway(0)
            }
          },
          {
            text: 'View',
            onClick: (e, toastObject) => {
              this.$store.commit('setMenuState', {
                state: MENU_STATES.CONVERSATION,
                args: conversationId
              })

              toastObject.goAway(0)
            }
          }
        ]
      })

      AudioService.join()
    },
    onGameStarted (data) {
      this.$store.commit('gameStarted', data)

      this.$toasted.show(`The game is full and will start soon. Reload the game now to view the galaxy.`, {
        duration: null,
        type: 'info',
        action: [
          {
            text: 'Dismiss',
            onClick: (e, toastObject) => {
              toastObject.goAway(0)
            }
          },
          {
            text: 'Reload',
            onClick: (e, toastObject) => {
              toastObject.goAway(0)

              location.reload()
            }
          }
        ]
      })
    },
    onGamePlayerRoomJoined (data) {
      let player = GameHelper.getPlayerById(this.$store.state.game, data.playerId)

      player.lastSeen = moment().utc()
      player.isOnline = true
    },
    onGamePlayerRoomLeft (data) {
      let player = GameHelper.getPlayerById(this.$store.state.game, data.playerId)

      player.lastSeen = moment().utc()
      player.isOnline = false
    },
    async reloadGameCheck () {
      if (!this.isLoggedIn || this.ticking) {
        return
      }

      // Check if the next tick date has passed, if so check if the server has finished the game tick.
      // Alternatively if the game is set to 10s ticks then always check.
      let canTick = this.$store.state.game.settings.gameTime.speed <= 10 || gameHelper.canTick(this.$store.state.game)

      if (canTick) {
        this.ticking = true

        try {
          let response = await GameApiService.getGameState(this.$store.state.game._id)
          
          if (response.status === 200) {
            if (this.$store.state.tick < response.data.state.tick) {
              // If the user is currently using the time machine then only set the state variables.
              // Otherwise reload the current game tick.
              if (this.$isHistoricalMode()) {
                this.$store.commit('setTick', response.data.state.tick)
                this.$store.commit('setProductionTick', response.data.state.productionTick)
              } else {
                await this.reloadGame()

                this.$toasted.show(`The game has ticked. Cycle ${response.data.state.productionTick}, Tick ${response.data.state.tick}.`, { type: 'success' })

                AudioService.download()
              }
            }
          }
        } catch (e) {
          console.error(e)
        }

        this.ticking = false
      }
    }
  },
  computed: {
    menuState () {
      return this.$store.state.menuState
    },
    menuArguments () {
      return this.$store.state.menuArguments
    },
    gameId () {
      return this.$store.state.game._id
    },
    hasGame () {
      return this.$store.state.game
    },
    isLoggedIn () {
      return this.$store.state.userId != null
    }
  }
}
</script>

<style scoped>
</style>
