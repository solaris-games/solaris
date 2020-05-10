import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'

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
    }
  },
  actions: {

  },
  plugins: [vuexPersist.plugin]
})
