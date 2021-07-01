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
    tick: 0,
    cachedConversationComposeMessages: {},
    currentConversation: null,
    starSpecialists: null,
    carrierSpecialists: null,
    settings: null,
    confirmationDialog: {}
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

    setUsername (state, username) {
      state.username = username
    },
    clearUsername (state) {
      state.username = null
    },

    setTick (state, tick) {
      state.tick = tick
    },
    setProductionTick (state, tick) {
      state.productionTick = tick
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
    setConfirmationDialogSettings (state, settings) {
      state.confirmationDialog = settings
    },
    openConversation (state, data) {
      state.currentConversation = {
        id: data,
        element: null,
        text: state.cachedConversationComposeMessages[data]
      }
    },
    closeConversation (state) {
      const id = state.currentConversation.id;
      state.cachedConversationComposeMessages[id] = state.currentConversation.text
      state.currentConversation = null
    },
    updateCurrentConversationText (state, data) {
      state.currentConversation.text = data
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
    replaceInConversationText (state, data) {
      MentionHelper.useSuggestion(state.currentConversation, data)
    },

    // ----------------
    // Sockets

    gameStarted (state, data) {
      state.game.state = data.state
    },

    gamePlayerJoined (state, data) {
      let player = GameHelper.getPlayerById(state.game, data.playerId)

      player.isEmptySlot = false
      player.alias = data.alias
      player.avatar = data.avatar
      player.defeated = false
      player.defeatedDate = null
      player.afk = false
    },

    gamePlayerQuit (state, data) {
      let player = GameHelper.getPlayerById(state.game, data.playerId)
      
      player.isEmptySlot = true
      player.alias = 'Empty Slot'
      player.avatar = null
    },

    gamePlayerReady (state, data) {
      let player = GameHelper.getPlayerById(state.game, data.playerId)

      player.ready = true
    },

    gamePlayerNotReady (state, data) {
      let player = GameHelper.getPlayerById(state.game, data.playerId)

      player.ready = false
    },

    gameStarBulkUpgraded (state, data) {
      let player = GameHelper.getUserPlayer(state.game)

      data.stars.forEach(s => {
        let star = GameHelper.getStarById(state.game, s.starId)

        star.infrastructure[data.infrastructureType] = s.infrastructure

        if (star.upgradeCosts && s.infrastructureCost) {
          star.upgradeCosts[data.infrastructureType] = s.infrastructureCost
        }

        if (s.manufacturing != null) {
          star.manufacturing = s.manufacturing
          player.stats.newShips = Math.round((player.stats.newShips + s.manufacturing + Number.EPSILON) * 100) / 100
        }

        GameContainer.reloadStar(star)
      })
      
      // Update player total stats.

      player.credits -= data.cost

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

      GameHelper.getUserPlayer(state.game).credits -= data.cost

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
      star.ships = data.starShips

      let userPlayer = GameHelper.getUserPlayer(state.game)
      userPlayer.credits -= star.upgradeCosts.carriers
      userPlayer.stats.totalCarriers++

      GameContainer.reloadStar(star)
      GameContainer.reloadCarrier(data.carrier)
    },
    gameStarCarrierShipTransferred (state, data) {
      let star = GameHelper.getStarById(state.game, data.starId)
      let carrier = GameHelper.getCarrierById(state.game, data.carrierId)

      star.ships = data.starShips
      carrier.ships = data.carrierShips

      GameContainer.reloadStar(star)
      GameContainer.reloadCarrier(carrier)
    },
    gameStarAllShipsTransferred (state, data) {
      let star = GameHelper.getStarById(state.game, data.star._id)

      star.ships = data.star.ships

      data.carriers.forEach(carrier => {
        let mapObjectCarrier = GameHelper.getCarrierById(state.game, carrier._id) 

        mapObjectCarrier.ships = carrier.ships
      })
    },
    gameStarAbandoned (state, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      let player = GameHelper.getPlayerById(state.game, star.ownedByPlayerId)
      player.stats.totalStars--

      star.ownedByPlayerId = null
      star.ships = 0

      // Redraw and remove carriers
      let carriers = state.game.galaxy.carriers.filter(x => x.orbiting && x.orbiting === star._id)

      carriers.forEach(c => GameContainer.undrawCarrier(c))

      state.game.galaxy.carriers = state.game.galaxy.carriers.filter(x => (x.orbiting || '') !== star._id)

      // Redraw the star
      GameContainer.reloadStar(star)
    },
    gameCarrierScuttled (state, data) {
      let carrier = GameHelper.getCarrierById(state.game, data.carrierId)
      let star = GameHelper.getStarById(state.game, carrier.orbiting)
      let player = GameHelper.getPlayerById(state.game, carrier.ownedByPlayerId)

      player.stats.totalCarriers--

      if (carrier.specialistId) {
        player.stats.totalSpecialists--
      }

      GameContainer.undrawCarrier(carrier)

      state.game.galaxy.carriers.splice(state.game.galaxy.carriers.indexOf(carrier), 1)

      if (star) {
        GameContainer.reloadStar(star)
      }
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
    },

    gameStarEconomyUpgraded (state, data) {
      data.type = 'economy'
      let star = GameHelper.starInfrastructureUpgraded(state.game, data)
      GameContainer.reloadStar(star)
    },
    gameStarIndustryUpgraded (state, data) {
      data.type = 'industry'
      let star = GameHelper.starInfrastructureUpgraded(state.game, data)
      GameContainer.reloadStar(star)
    },
    gameStarScienceUpgraded (state, data) {
      data.type = 'science'
      let star = GameHelper.starInfrastructureUpgraded(state.game, data)
      GameContainer.reloadStar(star)
    },
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
    },
    async confirm ({ commit, state }, data) {
      const modal = window.$('#confirmModal')
      const close = async () => {
        modal.modal('toggle')
        await new Promise(r => setTimeout(r, 400));
      }
      return new Promise((resolve, _reject) => {
        const settings = {
          confirmText: data.confirmText || 'Yes',
          cancelText: data.cancelText || 'No',
          hideCancelButton: Boolean(data.hideCancelButton),
          titleText: data.titleText,
          text: data.text,
          onConfirm: async () => {
            await close()
            resolve(true)
          },
          onCancel: async () => {
            await close()
            resolve(false)
          }
        }
        commit('setConfirmationDialogSettings', settings)
        modal.modal('toggle')
      })
    }
  },
  getters: {
    getConversationMessage: (state) => (conversationId) => {
      return state.cachedConversationComposeMessages[conversationId] || ''
    }
  },
  plugins: [vuexPersist.plugin]
})
