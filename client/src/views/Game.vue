<template>
  <div>
    <loading-spinner :loading="!hasGame"/>
    
    <div v-if="hasGame">
        <span class="d-none">{{ gameId }}</span>

        <main-bar :menuState="menuState"
                  :menuArguments="menuArguments"
                  @onMenuStateChanged="onMenuStateChanged"
                  @onPlayerSelected="onPlayerSelected"/>

        <game-container @onStarClicked="onStarClicked"
                    @onCarrierClicked="onCarrierClicked"
                    @onObjectsClicked="onObjectsClicked"/>
    </div>
  </div>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner'
import GameContainer from '../components/game/GameContainer.vue'
import MENU_STATES from '../components/data/menuStates'
import MainBar from '../components/game/menu/MainBar.vue'
import gameService from '../services/api/game'
import GameHelper from '../services/gameHelper'

export default {
  components: {
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
      } catch (err) {
        console.error(err)
      }
    },
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },

    // MENU

    resetMenuState () {
      this.menuState = null
      this.menuArguments = null
    },
    onMenuStateChanged (e) {
      this.menuState = e.state || null
      this.menuArguments = e.args || null

      this.$emit('onMenuStateChanged', e)
    },
    onPlayerSelected (e) {
      this.menuState = MENU_STATES.PLAYER
      this.menuArguments = e

      this.$emit('onPlayerSelected', e)
    },
    onStarClicked (e) {
      this.menuState = MENU_STATES.STAR_DETAIL
      this.menuArguments = e

      //this.$emit('onStarClicked', e)
    },
    onCarrierClicked (e) {
      this.menuState = MENU_STATES.CARRIER_DETAIL
      this.menuArguments = e

      //this.$emit('onCarrierClicked', e)
    },
    onObjectsClicked (e) {
      this.menuState = MENU_STATES.MAP_OBJECT_SELECTOR
      this.menuArguments = e
    },

    // --------------------
    // Sockets
    subscribeToSockets () {
      this.sockets.listener.subscribe('gameTicked', this.reloadGame)

      this.sockets.listener.subscribe('gameStarEconomyUpgraded', (data) => this.$store.commit('gameStarEconomyUpgraded', data))
      this.sockets.listener.subscribe('gameStarIndustryUpgraded', (data) => this.$store.commit('gameStarIndustryUpgraded', data))
      this.sockets.listener.subscribe('gameStarScienceUpgraded', (data) => this.$store.commit('gameStarScienceUpgraded', data))
      this.sockets.listener.subscribe('gameStarBulkUpgraded', (data) => this.$store.commit('gameStarBulkUpgraded', data))
      this.sockets.listener.subscribe('gameStarWarpGateBuilt', (data) => this.$store.commit('gameStarWarpGateBuilt', data))
      this.sockets.listener.subscribe('gameStarWarpGateDestroyed', (data) => this.$store.commit('gameStarWarpGateDestroyed', data))
      this.sockets.listener.subscribe('gameStarCarrierBuilt', (data) => this.$store.commit('gameStarCarrierBuilt', data))
      this.sockets.listener.subscribe('gameStarAbandoned', (data) => this.$store.commit('gameStarAbandoned', data))
    },
    unsubscribeToSockets () {
      this.sockets.listener.unsubscribe('gameTicked')
      this.sockets.listener.unsubscribe('gameStarEconomyUpgraded')
      this.sockets.listener.unsubscribe('gameStarIndustryUpgraded')
      this.sockets.listener.unsubscribe('gameStarScienceUpgraded')
      this.sockets.listener.unsubscribe('gameStarBulkUpgraded')
      this.sockets.listener.unsubscribe('gameStarWarpGateBuilt')
      this.sockets.listener.unsubscribe('gameStarWarpGateDestroyed')
      this.sockets.listener.unsubscribe('gameStarCarrierBuilt')
      this.sockets.listener.unsubscribe('gameStarAbandoned')
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
