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

        <game-container @onStarDoubleClicked="onStarDoubleClicked"
                    @onStarRightClicked="onStarRightClicked"
                    @onCarrierDoubleClicked="onCarrierDoubleClicked"
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
import gameService from '../services/api/game'
import GameHelper from '../services/gameHelper'
import AudioService from '../game/audio'

export default {
  components: {
    'logo': LogoVue,
    'loading-spinner': LoadingSpinnerVue,
    'game-container': GameContainer,
    'main-bar': MainBar
  },
  data () {
    return {
      menuState: null,
      menuArguments: null,
      MENU_STATES: MENU_STATES
    }
  },
  async created () {
    this.$store.commit('clearGame')

    this.subscribeToSockets()

    await this.reloadGame()

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
  },
  destroyed () {
    this.unsubscribeToSockets()

    this.$socket.emit('gameRoomLeft')
  },
  methods: {
    async reloadGame () {
      try {
        let galaxyResponse = await gameService.getGameGalaxy(this.$route.query.id)

        this.$store.commit('setGame', galaxyResponse.data) // Persist to storage

        document.title = galaxyResponse.data.settings.general.name + ' - Solaris'
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
      this.menuArguments = e.args || null
      this.menuState = e.state || null

      this.$emit('onMenuStateChanged', e)
    },
    onPlayerSelected (e) {
      this.menuArguments = e
      this.menuState = MENU_STATES.PLAYER

      this.$emit('onPlayerSelected', e)
    },
    onStarDoubleClicked (e) {
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
    onCarrierDoubleClicked (e) {
      this.menuArguments = e
      this.menuState = MENU_STATES.CARRIER_DETAIL

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
      this.sockets.subscribe('gameTicked', (data) => this.$store.commit('gameTicked', data))
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
      this.sockets.subscribe('gameMessageSent', (data) => this.onMessageReceived(data))
    },
    unsubscribeToSockets () {
      this.sockets.unsubscribe('gameTicked')
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
      this.sockets.unsubscribe('gameMessageSent')
    },
    onMessageReceived (e) {
      let fromPlayer = GameHelper.getPlayerById(this.$store.state.game, e.fromPlayerId)

      // Show a toast only if the user isn't already in the conversation.
      if (this.menuState === MENU_STATES.CONVERSATION && this.menuArguments === e.fromPlayerId) {
        return
      }

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
                args: fromPlayer._id
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
