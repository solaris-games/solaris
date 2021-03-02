<template>
  <div>
    <logo v-if="!hasGame"></logo>

    <loading-spinner :loading="!hasGame"/>

    <div v-if="hasGame">
        <span class="d-none">{{ gameId }}</span>

        <main-bar :menuState="menuState"
                  :menuArguments="menuArguments"
                  @onMenuStateChanged="onMenuStateChanged"
                  @onPlayerSelected="onPlayerSelected"/>

        <game-container @onStarClicked="onStarClicked"
                    @onStarRightClicked="onStarRightClicked"
                    @onCarrierClicked="onCarrierClicked"
                    @onCarrierRightClicked="onCarrierRightClicked"
                    @onObjectsClicked="onObjectsClicked"/>
    </div>
  </div>
</template>

<script>
import LogoVue from '../components/Logo'
import LoadingSpinnerVue from '../components/LoadingSpinner'
import GameContainer from '../components/game/GameContainer.vue'
import MENU_STATES from '../components/data/menuStates'
import MainBar from '../components/game/menu/MainBar.vue'
import GameApiService from '../services/api/game'
import UserApiService from '../services/api/user'
import GameHelper from '../services/gameHelper'
import AudioService from '../game/audio'
import moment from 'moment'
import gameHelper from '../services/gameHelper'

export default {
  components: {
    'logo': LogoVue,
    'loading-spinner': LoadingSpinnerVue,
    'game-container': GameContainer,
    'main-bar': MainBar
  },
  data () {
    return {
      audio: null,
      menuState: null,
      menuArguments: null,
      MENU_STATES: MENU_STATES,
      polling: null
    }
  },
  async created () {
    AudioService.loadStore(this.$store)

    this.$store.commit('clearGame')

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

    // Check if the user is in this game, if not then show the welcome screen.
    this.menuState = this.getUserPlayer() ? 'leaderboard' : 'welcome'

    this.polling = setInterval(this.reloadGameCheck, 10000)

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
    async reloadGame () {
      try {
        let galaxyResponse = await GameApiService.getGameGalaxy(this.$route.query.id)

        // Make sure the player is still in the current game, they may have quickly
        // switched to another game.
        if (this.$route.query.id === galaxyResponse.data._id) {
          this.$store.commit('setGame', galaxyResponse.data) // Persist to storage

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
      this.menuArguments = null
      this.menuState = null
    },
    onMenuStateChanged (e) {
      e.args = e.args || null
      e.state = e.state || null

      // Toggle menu if its already open.
      if (e.state === this.menuState && e.args === this.menuArguments) {
        this.menuArguments = null
        this.menuState = null
      } else {
        this.menuArguments = e.args
        this.menuState = e.state
      }

      this.$emit('onMenuStateChanged', e)
    },
    onPlayerSelected (e) {
      this.menuArguments = e
      this.menuState = MENU_STATES.PLAYER

      this.$emit('onPlayerSelected', e)
    },
    onStarClicked (e) {
      this.menuArguments = e
      this.menuState = MENU_STATES.STAR_DETAIL

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
      this.menuArguments = e
      this.menuState = MENU_STATES.CARRIER_DETAIL

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
      this.menuArguments = e
      this.menuState = MENU_STATES.MAP_OBJECT_SELECTOR

      AudioService.open()
    },

    // --------------------
    // Sockets
    subscribeToSockets () {
      // TODO: Move all component subscriptions into the components' socket object.
      this.sockets.subscribe('gameStarted', (data) => this.onGameStarted(data))
      this.sockets.subscribe('gameStarEconomyUpgraded', (data) => this.$store.commit('gameStarEconomyUpgraded', data))
      this.sockets.subscribe('gameStarIndustryUpgraded', (data) => this.$store.commit('gameStarIndustryUpgraded', data))
      this.sockets.subscribe('gameStarScienceUpgraded', (data) => this.$store.commit('gameStarScienceUpgraded', data))
      this.sockets.subscribe('gameStarBulkUpgraded', (data) => this.$store.commit('gameStarBulkUpgraded', data))
      this.sockets.subscribe('gameStarWarpGateBuilt', (data) => this.$store.commit('gameStarWarpGateBuilt', data))
      this.sockets.subscribe('gameStarWarpGateDestroyed', (data) => this.$store.commit('gameStarWarpGateDestroyed', data))
      this.sockets.subscribe('gameStarCarrierBuilt', (data) => this.$store.commit('gameStarCarrierBuilt', data))
      this.sockets.subscribe('gameStarCarrierShipTransferred', (data) => this.$store.commit('gameStarCarrierShipTransferred', data))
      this.sockets.subscribe('gameStarAbandoned', (data) => this.$store.commit('gameStarAbandoned', data))
      this.sockets.subscribe('playerDebtSettled', (data) => this.$store.commit('playerDebtSettled', data))
      this.sockets.subscribe('starSpecialistHired', (data) => this.$store.commit('starSpecialistHired', data))
      this.sockets.subscribe('carrierSpecialistHired', (data) => this.$store.commit('carrierSpecialistHired', data))
      this.sockets.subscribe('gameMessageSent', (data) => this.onMessageReceived(data))

      if (!GameHelper.isHiddenPlayerOnlineStatus(this.$store.state.game)) {
        this.sockets.subscribe('gamePlayerRoomJoined', (data) => this.onGamePlayerRoomJoined(data))
        this.sockets.subscribe('gamePlayerRoomLeft', (data) => this.onGamePlayerRoomLeft(data))
      }
    },
    unsubscribeToSockets () {
      this.sockets.unsubscribe('gameStarted')
      this.sockets.unsubscribe('gameStarEconomyUpgraded')
      this.sockets.unsubscribe('gameStarIndustryUpgraded')
      this.sockets.unsubscribe('gameStarScienceUpgraded')
      this.sockets.unsubscribe('gameStarBulkUpgraded')
      this.sockets.unsubscribe('gameStarWarpGateBuilt')
      this.sockets.unsubscribe('gameStarWarpGateDestroyed')
      this.sockets.unsubscribe('gameStarCarrierBuilt')
      this.sockets.unsubscribe('gameStarCarrierShipTransferred')
      this.sockets.unsubscribe('gameStarAbandoned')
      this.sockets.unsubscribe('playerDebtSettled')
      this.sockets.unsubscribe('starSpecialistHired')
      this.sockets.unsubscribe('carrierSpecialistHired')
      this.sockets.unsubscribe('gameMessageSent')
    },
    onMessageReceived (e) {
      let conversationId = e.conversationId

      // Show a toast only if the user isn't already in the conversation.
      if (this.menuState === MENU_STATES.CONVERSATION && this.menuArguments === conversationId) {
        return
      }

      let fromPlayer = GameHelper.getPlayerById(this.$store.state.game, e.fromPlayerId)

      this.$toasted.show(`New message from ${fromPlayer.alias}.`, {
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
            text: 'View',
            onClick: (e, toastObject) => {
              this.onMenuStateChanged({
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

              window.location.reload()
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
      // Check if the next tick date has passed, if so check if the server has finished the game tick.
      let canTick = gameHelper.canTick(this.$store.state.game)

      if (canTick) {
        try {
          let response = await GameApiService.getGameState(this.$store.state.game._id)
          
          if (response.status === 200) {
            
            if (this.$store.state.game.state.tick < response.data.state.tick) {
              await this.reloadGame()
            }
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
  },
  computed: {
    gameId () {
      return this.$store.state.game._id
    },
    hasGame () {
      return this.$store.state.game
    }
  }
}
</script>

<style scoped>
</style>
