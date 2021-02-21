<template>
<div class="container-fluid bg-dark pt-2 pb-2 footer-bar">
    <div class="row no-gutters">
        <div class="col">
          <button class="btn" v-on:click="setMenuState(MENU_STATES.LEADERBOARD)">
            <i class="fas fa-users"></i>
          </button>
        </div>
        <div class="col">
          <button class="btn" v-on:click="setMenuState(MENU_STATES.RESEARCH)">
            <i class="fas fa-flask"></i>
          </button>
        </div>
        <div class="col">
          <button class="btn" @click="panToHomeStar()">
            <i class="fas fa-home"></i>
          </button>
        </div>
        <div class="col">
          <button class="btn" v-on:click="setMenuState(MENU_STATES.GALAXY)">
            <i class="fas fa-sun"></i>
          </button>
        </div>
        <div class="col">
          <hamburger-menu :dropType="'dropup'"
            @onMenuStateChanged="onMenuStateChanged" />
        </div>
    </div>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import MENU_STATES from '../../data/menuStates'
import HamburgerMenuVue from './HamburgerMenu.vue'
import GameContainer from '../../../game/container'

export default {
  components: {
    'hamburger-menu': HamburgerMenuVue
  },
  data () {
    return {
      MENU_STATES: MENU_STATES
    }
  },
  mounted () {
    
  },
  methods: {
    setMenuState (state, args) {
      this.$emit('onMenuStateChanged', {
        state,
        args
      })
    },
    onMenuStateChanged (e) {
      this.$emit('onMenuStateChanged', e)
    },
    panToHomeStar () {
      GameContainer.map.panToUser(this.$store.state.game)

      if (this.userPlayer) {
        this.$emit('onOpenPlayerDetailRequested', this.userPlayer._id)
      }
    }
  },
  computed: {
    userPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
.pointer {
  cursor:pointer;
}

.col {
  text-align: center;
}
</style>
