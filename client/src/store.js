import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'
import GameHelper from './services/gameHelper'
import GameContainer from './game/container'

Vue.use(Vuex)

const vuexPersist = new VuexPersist({
  key: 'solaris',
  storage: localStorage
})

export default new Vuex.Store({
  state: {
    userId: null,
    game: null
  },
  mutations: {
    setUserId (state, userId) {
      state.userId = userId
    },
    clearUserId (state) {
      state.userId = null
    },

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
    gameStarBulkUpgraded (state, data) {
      data.stars.forEach(s => {
        let star = GameHelper.getStarById(state.game, s.starId)

        star.infrastructure[data.infrastructureType] = s.infrastructure
      })
    },
    gameStarWarpGateBuilt (state, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      star.warpGate = true
    },
    gameStarWarpGateDestroyed (state, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      star.warpGate = false
    },
    gameStarCarrierBuilt (state, data) {
      state.game.galaxy.carriers.push(data)

      let star = GameHelper.getStarById(state.game, data.orbiting)
      star.garrison -= data.ships;

      GameContainer.setup()
      GameContainer.draw()
    },
    gameStarAbandoned (state, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      star.ownedByPlayerId = null
      star.garrison = 0
      star.garrisonActual = 0
    },

  },
  actions: {

  },
  plugins: [vuexPersist.plugin]
})
