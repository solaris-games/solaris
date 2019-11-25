import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'

Vue.use(Vuex)

const vuexPersist = new VuexPersist({
  key: 'np-clone',
  storage: localStorage
})

export default new Vuex.Store({
  state: {
    userId: null
  },
  mutations: {
    setUserId (state, id) {
      state.userId = id
    },
    clearUserId (state) {
      state.userId = null
    }
  },
  actions: {

  },
  plugins: [vuexPersist.plugin]
})
