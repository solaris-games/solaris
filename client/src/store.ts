import { createStore } from 'vuex';
import { type Axios } from 'axios';
import { type EventBus } from './eventBus';
import MenuEventBusEventNames from './eventBusEventNames/menu';
import GameMutationNames from './mutationNames/gameMutationNames';
import PlayerMutationNames from './mutationNames/playerMutationNames';
import GameHelper from './services/gameHelper.js';
import type { Game, Player, Star } from "./types/game";
import type { Store } from 'vuex/types/index.js';
import type { Specialist, UserGameSettings } from "@solaris-common";
import {formatError, isOk} from "./services/typedapi";
import GameCommandEventBusEventNames from "@/eventBusEventNames/gameCommand";
import type { OnPreStarParams } from './eventBusEventNames/map';
import {listCarrierForGame, listStarForGame} from "@/services/typedapi/specialist";
import { useColourStore } from '@/stores/colour';

export type State = {
  game: Game | null;
  tick: number;
  starSpecialists: Specialist[] | null;
  carrierSpecialists: Specialist[] | null;
  settings: UserGameSettings | null;
  menuState: string | null;
  menuArguments: any;
  menuStateChat: string | null;
  menuArgumentsChat: any;
  productionTick: number | null;
  unreadMessages: number | null;
}

export function createSolarisStore(eventBus: EventBus, httpClient: Axios): Store<State> {
  return createStore<State>({
  state: {
    game: null,
    tick: 0,
    starSpecialists: null,
    carrierSpecialists: null,
    settings: null,
    menuState: null,
    menuArguments: null,
    menuStateChat: null,
    menuArgumentsChat: null,
    productionTick: null,
    unreadMessages: null,
  },
  mutations: {
    // Menu
    setMenuState (state: State, menuState) {
      menuState.state = menuState.state || null
      menuState.args = menuState.args || null

      // Toggle menu if its already open.
      if (menuState.state === state.menuState && menuState.args === state.menuArguments) {
        state.menuArguments = null
        state.menuState = null
      } else {
        state.menuArguments = menuState.args
        state.menuState = menuState.state
      }

      eventBus.emit(MenuEventBusEventNames.OnMenuRequested, menuState)
    },
    clearMenuState (state) {
      state.menuState = null
      state.menuArguments = null

      // TODO: Refactor menu handling
      eventBus.emit(MenuEventBusEventNames.OnMenuRequested, {
        menuState: null,
        menuArguments: null,
      } as any)
    },

    setMenuStateChat (state: State, menuState) {
      menuState.state = menuState.state || null
      menuState.args = menuState.args || null

      state.menuArgumentsChat = menuState.args
      state.menuStateChat = menuState.state
    },
    clearMenuStateChat (state) {
      state.menuStateChat = null
      state.menuArgumentsChat = null
    },

    setCarrierSpecialists (state: State, carrierSpecialists) {
      state.carrierSpecialists = carrierSpecialists;
    },
    setStarSpecialists (state: State, starSpecialists) {
      state.starSpecialists = starSpecialists;
    },

    setTick (state: State, tick) {
      state.tick = tick
    },
    setProductionTick (state: State, tick) {
      state.productionTick = tick
    },

    setGame (state: State, game) {
      state.game = game
      useColourStore().setColourMappingFromGame(game);
    },
    clearGame (state) {
      state.game = null
      state.carrierSpecialists = null;
      state.starSpecialists = null;
      useColourStore().clearColourState();
    },

    setSettings (state: State, settings) {
      state.settings = settings
    },
    clearSettings (state) {
      state.settings = null
    },

    setUnreadMessages (state: State, count) {
      state.unreadMessages = count
    },
    clearUnreadMessages (state) {
      state.unreadMessages = null
    },

    // ----------------
    // Sockets

    [GameMutationNames.GameStarted] (state: State, data) {
      state.game!.state = data.state
    },

    [PlayerMutationNames.GamePlayerJoined] (state: State, data) {
      let player = GameHelper.getPlayerById(state.game!, data.playerId)!

      player.isOpenSlot = false
      player.alias = data.alias
      player.avatar = data.avatar
      player.defeated = false
      player.defeatedDate = null
      player.afk = false
    },

    [PlayerMutationNames.GamePlayerQuit] (state: State, data) {
      let player = GameHelper.getPlayerById(state.game!, data.playerId)!

      player.isOpenSlot = true
      player.alias = 'Empty Slot'
      player.avatar = null
    },

    [PlayerMutationNames.GamePlayerReady] (state: State, data) {
      let player = GameHelper.getPlayerById(state.game!, data.playerId)!

      player.ready = true;
    },

    [PlayerMutationNames.GamePlayerConcededDefeat] (state: State, data) {
      const player = GameHelper.getPlayerById(state.game!, data.playerId)!

      player.defeated = true;
    },

    [PlayerMutationNames.GamePlayerNotReady] (state: State, data) {
      let player = GameHelper.getPlayerById(state.game!, data.playerId)!

      player.ready = false
    },

    [PlayerMutationNames.GamePlayerReadyToQuit](state: State, data) {
      if (data.playerId != null) {
        let player = GameHelper.getPlayerById(state.game!, data.playerId)!;

        player.readyToQuit = true
      }

      state.game!.state.readyToQuitCount = (state.game!.state.readyToQuitCount ?? 0) + 1;
    },

    [PlayerMutationNames.GamePlayerNotReadyToQuit](state: State, data) {
      if (data.playerId != null) {
        let player = GameHelper.getPlayerById(state.game!, data.playerId)!;

        player.readyToQuit = false
      }

      state.game!.state.readyToQuitCount = (state.game!.state.readyToQuitCount ?? 0) - 1;
    },

    gameStarBulkUpgraded (state: State, data) {
      const player = GameHelper.getUserPlayer(state.game!)!;

      let newScience = 0;

      data.stars.forEach(s => {
        const star = GameHelper.getStarById(state.game!, s.starId)!;

        if (data.infrastructureType === 'science') {
          newScience += (s.infrastructure - s.infrastructureCurrent) * (star.specialistId === 11 ? 2 : 1); // Research Station
        }

        star.infrastructure[data.infrastructureType] = s.infrastructure

        if (star.upgradeCosts && s.nextInfrastructureCost) {
          star.upgradeCosts[data.infrastructureType] = s.nextInfrastructureCost
        }

        if (s.manufacturing != null) {
          player.stats!.newShips -= (star.manufacturing || 0) // Deduct old value
          star.manufacturing = s.manufacturing
          player.stats!.newShips += s.manufacturing // Add the new value
        }

        eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
      })

      player.credits -= data.cost
      player.stats!.newShips = Math.round((player.stats!.newShips + Number.EPSILON) * 100) / 100

      if (data.currentResearchTicksEta) {
        player.currentResearchTicksEta = data.currentResearchTicksEta
      }

      if (data.nextResearchTicksEta) {
        player.nextResearchTicksEta = data.nextResearchTicksEta
      }

      // Update player total stats.
      switch (data.infrastructureType) {
        case 'economy':
          player.stats!.totalEconomy += data.upgraded
          break;
        case 'industry':
          player.stats!.totalIndustry += data.upgraded
          break;
        case 'science':
          player.stats!.totalScience += (newScience * state.game!.constants.research.sciencePointMultiplier)
          break;
      }
    },
    gameBulkActionAdded(state: State, data) {
      const player = GameHelper.getUserPlayer(state.game!)!;
      player.scheduledActions.push(data);
    },
    gameBulkActionTrashed(state: State, data) {
      const player = GameHelper.getUserPlayer(state.game!)!;
      player.scheduledActions = player.scheduledActions.filter(a => a._id != data._id)
    },
    gameStarWarpGateBuilt (state: State, data) {
      const star = GameHelper.getStarById(state.game!, data.starId)!;

      star.warpGate = true

      GameHelper.getUserPlayer(state.game!)!.credits -= data.cost;

      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
    },
    gameStarWarpGateDestroyed (state: State, data) {
      let star = GameHelper.getStarById(state.game!, data.starId)!;

      star.warpGate = false

      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
    },
    gameStarCarrierBuilt (state: State, data) {
      let carrier = GameHelper.getCarrierById(state.game!, data.carrier._id);

      if (!carrier) {
        state.game!.galaxy.carriers.push(data.carrier)
      }

      let star = GameHelper.getStarById(state.game!, data.carrier.orbiting)!;
      star.ships = data.starShips

      let userPlayer = GameHelper.getUserPlayer(state.game!)!;
      userPlayer.credits -= star.upgradeCosts!.carriers || 0;
      userPlayer.stats!.totalCarriers++

      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, { carrier: data.carrier });
    },
    gameStarCarrierShipTransferred (state: State, data) {
      let star = GameHelper.getStarById(state.game!, data.starId)!;
      let carrier = GameHelper.getCarrierById(state.game!, data.carrierId)!;

      star.ships = data.starShips
      carrier.ships = data.carrierShips

      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, { carrier });
    },
    gameStarAllShipsTransferred (state: State, data) {
      let star = GameHelper.getStarById(state.game!, data.star._id)!

      star.ships = data.star.ships

      data.carriers.forEach(carrier => {
        let mapObjectCarrier = GameHelper.getCarrierById(state.game!, carrier._id)!

        mapObjectCarrier.ships = carrier.ships
      })
    },
    gameStarAbandoned (state: State, data) {
      let star = GameHelper.getStarById(state.game!, data.starId)!

      let player = GameHelper.getPlayerById(state.game!, star.ownedByPlayerId!)!
      player.stats!.totalStars--

      star.ownedByPlayerId = null
      star.ships = 0

      // Redraw and remove carriers
      let carriers = state.game!.galaxy.carriers.filter(x => x.orbiting && x.orbiting === star._id && x.ownedByPlayerId === player._id)

      carriers.forEach(c => {
        eventBus.emit(GameCommandEventBusEventNames.GameCommandRemoveCarrier, { carrier: c });
        state.game!.galaxy.carriers.splice(state.game!.galaxy.carriers.indexOf(c), 1)
      })

      // Redraw the star
      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
    },
    [PlayerMutationNames.PlayerDebtSettled] (state: State, data) {
      let player = GameHelper.getUserPlayer(state.game!)!

      if (data.creditorPlayerId === player._id) {
        if (data.ledgerType === 'credits') {
          player.credits += data.amount
        } else {
          player.creditsSpecialists += data.amount
        }
      }
    },
    gameStarEconomyUpgraded (state: State, data) {
      data.type = 'economy'
      const star = GameHelper.starInfrastructureUpgraded(state.game!, data)
      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
    },
    gameStarIndustryUpgraded (state: State, data) {
      data.type = 'industry'
      const star = GameHelper.starInfrastructureUpgraded(state.game!, data)
      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
    },
    gameStarScienceUpgraded (state: State, data) {
      data.type = 'science'
      const star = GameHelper.starInfrastructureUpgraded(state.game!, data)
      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
    },
  },
  actions: {
    async loadSpecialistData ({ commit, state }, gameId: string) {
      const requests = [
        listCarrierForGame(httpClient)(gameId),
        listStarForGame(httpClient)(gameId),
      ];

      const responses = await Promise.all(requests)

      const carrierResponse = responses[0];

      if (isOk(carrierResponse)) {
        commit('setCarrierSpecialists', carrierResponse.data);
      } else {
        console.error(formatError(carrierResponse));
      }

      const starResponse = responses[1];

      if (isOk(starResponse)) {
        commit('setStarSpecialists', starResponse.data);
      } else {
        console.error(formatError(starResponse));
      }
    },
  },
  })
}
