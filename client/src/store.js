import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'
import GameHelper from './services/gameHelper'
import MentionHelper from './services/mentionHelper'
import GameContainer from './game/container'
import SpecialistService from './services/api/specialist';

Vue.use(Vuex)

const vuexPersist = new VuexPersist({
  key: 'solaris',
  storage: localStorage
})

export default new Vuex.Store({
  state: {
    userId: null,
    game: null,
    cachedConversationComposeMessages: {},
    currentConversation: null,
    starSpecialists: null,
    carrierSpecialists: null,
    settings: null
  },
  mutations: {
    setCarrierSpecialists (state, carrierSpecialists) {
      state.carrierSpecialists = carrierSpecialists;
    },
    setStarSpecialists (state, starSpecialists) {
      state.starSpecialists = starSpecialists;
    },

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
      state.cachedConversationComposeMessages = {}
      state.currentConversation = null;
    },

    setSettings (state, settings) {
      state.settings = settings
    },
    clearSettings (state) {
      state.settings = null
    },
    openConversation (state, data) {
      state.currentConversation = {
        id: data,
        element: null,
        text: state.cachedConversationComposeMessages[data],
        suggestions: [ "Test", "Test2" ],
        currentMention: null
      }
    },
    updateCurrentMention (state, key) {
      MentionHelper.tryBeginMention(state.currentConversation, key, state.settings.interface.suggestMentions)
    },
    unfocusConversation (state, data) {
      MentionHelper.endMention(state.currentConversation)
    },
    closeConversation (state) {
      const id = state.currentConversation.id;
      state.cachedConversationComposeMessages[id] = state.currentConversation.text
      state.currentConversation = null
    },
    updateCurrentConversationText (state, data) {
      state.currentConversation.text = data
      MentionHelper.updateMention(state.currentConversation, state.settings.interface.suggestMentions)
    },
    resetCurrentConversationText (state, data) {
      state.currentConversation.text = ''
    },
    setConversationElement (state, data) {
      state.currentConversation.element = data
    },
    playerClicked (state, data) {
      if (state.currentConversation) {
        MentionHelper.addMention(state.currentConversation, 'player', data.player.alias)
      } else {
        data.permitCallback(data.player)
      }
    },
    starClicked (state, data) {
      if (state.currentConversation) {
        MentionHelper.addMention(state.currentConversation, 'star', data.star.name)
      } else {
        data.permitCallback(data.star)
      }
    },

    // ----------------
    // Sockets

    gameStarted (state, data) {
      state.game.state = data.state
    },

    gameStarEconomyUpgraded (state, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      star.infrastructure.economy = data.infrastructure

      let player = GameHelper.getPlayerById(state.game, star.ownedByPlayerId)
      player.stats.totalEconomy++

      GameContainer.reloadStar(star)
    },
    gameStarIndustryUpgraded (state, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      let manufacturingDifference = data.manufacturing - star.manufacturing

      star.infrastructure.industry = data.infrastructure
      star.manufacturing = data.manufacturing

      let player = GameHelper.getPlayerById(state.game, star.ownedByPlayerId)
      player.stats.totalIndustry++
      player.stats.newShips = +(player.stats.newShips + manufacturingDifference).toFixed(2)

      GameContainer.reloadStar(star)
    },
    gameStarScienceUpgraded (state, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      star.infrastructure.science = data.infrastructure

      let player = GameHelper.getPlayerById(state.game, star.ownedByPlayerId)
      player.stats.totalScience++

      GameContainer.reloadStar(star)
    },
    gameStarBulkUpgraded (state, data) {
      data.stars.forEach(s => {
        let star = GameHelper.getStarById(state.game, s.starId)

        star.infrastructure[data.infrastructureType] = s.infrastructure

        if (star.upgradeCosts && s.infrastructureCost) {
          star.upgradeCosts[data.infrastructureType] = s.infrastructureCost
        }

        GameContainer.reloadStar(star)
      })
      
      // Update player total stats.
      let player = GameHelper.getPlayerById(state.game, data.playerId)

      switch (data.infrastructureType) {
        case 'economy': 
          player.stats.totalEconomy += data.upgraded 
          break;
        case 'industry': 
          player.stats.totalIndustry += data.upgraded 
          break;
        case 'science': 
          player.stats.totalScience += data.upgraded 
          break;
      }
    },
    gameStarWarpGateBuilt (state, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      star.warpGate = true

      GameContainer.reloadStar(star)
    },
    gameStarWarpGateDestroyed (state, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      star.warpGate = false

      GameContainer.reloadStar(star)
    },
    gameStarCarrierBuilt (state, data) {
      let carrier = GameHelper.getCarrierById(state.game, data.carrier._id)

      if (!carrier) {
        state.game.galaxy.carriers.push(data.carrier)
      }

      let star = GameHelper.getStarById(state.game, data.carrier.orbiting)

      star.garrison = data.starGarrison

      let player = GameHelper.getPlayerById(state.game, star.ownedByPlayerId)
      player.stats.totalCarriers++

      GameContainer.reloadCarrier(data.carrier)
      GameContainer.reloadStar(star)
    },
    gameStarCarrierShipTransferred (state, data) {
      let star = GameHelper.getStarById(state.game, data.starId)
      let carrier = GameHelper.getCarrierById(state.game, data.carrierId)

      star.garrison = data.starShips
      carrier.ships = data.carrierShips

      GameContainer.reloadStar(star)
      GameContainer.reloadCarrier(carrier)
    },
    gameStarAbandoned (state, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      let player = GameHelper.getPlayerById(state.game, star.ownedByPlayerId)
      player.stats.totalStars--

      star.ownedByPlayerId = null
      star.garrison = 0

      // Redraw and remove carriers
      let carriers = state.game.galaxy.carriers.filter(x => x.orbiting && x.orbiting === star._id)

      carriers.forEach(c => GameContainer.undrawCarrier(c))

      state.game.galaxy.carriers = state.game.galaxy.carriers.filter(x => (x.orbiting || '') !== star._id)

      // Redraw the star
      GameContainer.reloadStar(star)
    },
    playerDebtSettled (state, data) {
      let player = GameHelper.getUserPlayer(state.game)

      if (data.creditorPlayerId === player._id) {
        player.credits += data.amount
      }
    },
    starSpecialistHired (state, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      star.specialistId = data.specialist.id
      star.specialist = data.specialist

      GameContainer.reloadStar(star)
    },
    carrierSpecialistHired (state, data) {
      let carrier = GameHelper.getCarrierById(state.game, data.carrierId)

      carrier.specialistId = data.specialist.id
      carrier.specialist = data.specialist

      GameContainer.reloadCarrier(carrier)
    }
  },
  actions: {
    async loadSpecialistData ({ commit, state }) {
      const gameId = state.game._id;

      let requests = [
        SpecialistService.getCarrierSpecialists(gameId),
        SpecialistService.getStarSpecialists(gameId)
      ]

      const responses = await Promise.all(requests)
      
      commit('setCarrierSpecialists', responses[0].data)
      commit('setStarSpecialists', responses[1].data)
    }
  },
  getters: {
    getConversationMessage: (state) => (conversationId) => {
      return state.cachedConversationComposeMessages[conversationId] || ''
    }
  },
  plugins: [vuexPersist.plugin]
})
