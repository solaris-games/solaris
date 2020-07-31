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

    gameTicked (state, data) {
      let report = data.report

      // Update game state
      state.game.state.lastTickDate = report.gameState.lastTickDate
      state.game.state.paused = report.gameState.paused
      state.game.state.players = report.gameState.players
      state.game.state.productionTick = report.gameState.productionTick
      state.game.state.tick = report.gameState.tick
      state.game.state.endDate = report.gameState.endDate
      state.game.state.winner = report.gameState.winner

      // Update stars
      for (let reportStar of report.stars) {
        let star = GameHelper.getStarById(state.game, reportStar._id)

        star.ownedByPlayerId = reportStar.ownedByPlayerId
        star.garrison = reportStar.garrison
        star.infrastructure = reportStar.infrastructure

        GameContainer.reloadStar(star)
      }

      // Update carriers
      for (let reportCarrier of report.carriers) {
        let carrier = GameHelper.getCarrierById(state.game, reportCarrier._id)

        // TODO: Carriers do not despawn on the map when they leave scanning range.

        if (reportCarrier.destroyed) {
          state.game.galaxy.carriers.splice(state.game.galaxy.carriers.indexOf(carrier), 1)

          GameContainer.undrawCarrier(carrier)
        } else if (!carrier) {
          state.game.galaxy.carriers.push(reportCarrier)

          GameContainer.reloadCarrier(reportCarrier)
        } else {
          carrier.ownedByPlayerId = reportCarrier.ownedByPlayerId
          carrier.orbiting = reportCarrier.orbiting
          carrier.inTransitFrom = reportCarrier.inTransitFrom
          carrier.inTransitTo = reportCarrier.inTransitTo
          carrier.ships = reportCarrier.ships
          carrier.location = reportCarrier.location
          carrier.waypoints = reportCarrier.waypoints
          carrier.ticksEta = reportCarrier.ticksEta
          carrier.ticksEtaTotal = reportCarrier.ticksEtaTotal

          GameContainer.reloadCarrier(carrier)
        }
      }

      // Update players
      for (let reportPlayer of report.players) {
        let player = GameHelper.getPlayerById(state.game, reportPlayer._id)

        player.defeated = reportPlayer.defeated
        player.afk = reportPlayer.afk
        player.stats = reportPlayer.stats
      }

      // Update player research
      for (let reportResearch of report.playerResearch) {
        let player = GameHelper.getPlayerById(state.game, reportResearch.playerId)

        player.research[reportResearch.technology.name].level = reportResearch.technology.level
      }
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
      player.stats.newShips += manufacturingDifference

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

        // TODO: Update the player stats

        GameContainer.reloadStar(star)
      })
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
      state.game.galaxy.carriers.push(data)

      let star = GameHelper.getStarById(state.game, data.orbiting)
      star.garrison -= data.ships

      let player = GameHelper.getPlayerById(state.game, star.ownedByPlayerId)
      player.stats.totalCarriers++

      GameContainer.reloadCarrier(data)
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

      star.ownedByPlayerId = null
      star.garrison = 0
      star.garrisonActual = 0

      let player = GameHelper.getPlayerById(state.game, star.ownedByPlayerId)
      player.stats.totalStars--

      // Redraw and remove carriers
      let carriers = state.game.galaxy.carriers.filter(x => x.orbiting && x.orbiting === star._id)

      carriers.forEach(c => GameContainer.undrawCarrier(c))

      state.game.galaxy.carriers = state.game.galaxy.carriers.filter(x => (x.orbiting || '') != star._id);

      // Redraw the star
      GameContainer.reloadStar(star)
    },

  },
  actions: {

  },
  plugins: [vuexPersist.plugin]
})
