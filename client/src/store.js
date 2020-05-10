import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'
import GameHelper from './services/gameHelper'

Vue.use(Vuex)

const vuexPersist = new VuexPersist({
  key: 'solaris',
  storage: localStorage
})

export default new Vuex.Store({
  state: {
    game: null
  },
  mutations: {
    setGame (state, game) {
      state.game = game
    },
    clearGame (state) {
      state.game = null
    },

    // ----------------
    // Sockets

    gameStarEconomyUpgraded (state, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      star.infrastructure.economy = data.infrastructure
    },
    gameStarIndustryUpgraded (state, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      star.infrastructure.industry = data.infrastructure
    },
    gameStarScienceUpgraded (state, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      star.infrastructure.science = data.infrastructure
    },

  },
  actions: {

  },
  plugins: [vuexPersist.plugin]
})
