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
      game: null,
      menuState: null,
      menuArguments: null,
      MENU_STATES: MENU_STATES
    }
  },
  async created () {
    this.$store.commit('clearGame')

    await this.reloadGame()

    // Check if the user is in this game, if not then show the welcome screen.
    this.menuState = this.getUserPlayer() ? 'leaderboard' : 'welcome'
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
    }

    // --------------------
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
