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
    userId: null // TODO: This doesn't appear to be used by the UI at all, do we still need this?
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
