import { createStore } from 'vuex';
import { type Axios } from 'axios';
import { type EventBus } from './eventBus';
import MenuEventBusEventNames from './eventBusEventNames/menu';
import GameMutationNames from './mutationNames/gameMutationNames';
import PlayerMutationNames from './mutationNames/playerMutationNames';
import ApiAuthService from "./services/api/auth.js";
import ApiUserService from "./services/api/user.js";
import ColourService from './services/api/colour.js';
import SpecialistService from './services/api/specialist.js';
import GameHelper from './services/gameHelper.js';
import type { Game, Player, Star } from "./types/game";
import type { Store } from 'vuex/types/index.js';
import type {Badge} from "@solaris-common";
import {getBadges} from "./services/typedapi/badge";
import {isError} from "./services/typedapi";
import type {UserClientSocketEmitter} from "@/sockets/socketEmitters/user";
import GameCommandEventBusEventNames from "@/eventBusEventNames/gameCommand";

export type MentionCallbacks = {
  player: (p: Player) => void;
  star: (s: Star) => void;
}

export type State = {
  userId: string | null;
  user: any;
  game: Game | null;
  tick: number;
  cachedConversationComposeMessages: Record<string, string>;
  currentConversation: {id: string, text: string} | null;
  mentionReceivingElement: HTMLElement | null;
  mentionCallbacks: MentionCallbacks | null;
  starSpecialists: any;
  carrierSpecialists: any;
  settings: any;
  confirmationDialog: any;
  colourOverride: boolean;
  coloursConfig: any;
  colourMapping: Record<string, any>;
  menuState: string | null;
  menuArguments: any;
  tutorialPage: number;
  menuStateChat: string | null;
  menuArgumentsChat: any;
  username: string | null;
  roles: string[] | null;
  userCredits: number | null;
  isImpersonating: boolean | null;
  userIsEstablishedPlayer: boolean | null;
  productionTick: number | null;
  unreadMessages: number | null;
  badges: Badge[];
}

export function createSolarisStore(eventBus: EventBus, httpClient: Axios, userClientSocketEmitter: UserClientSocketEmitter): Store<State> {
  return createStore<State>({
  state: {
    userId: null,
    game: null,
    tick: 0,
    cachedConversationComposeMessages: {},
    currentConversation: null,
    mentionReceivingElement: null,
    mentionCallbacks: null,
    starSpecialists: null,
    carrierSpecialists: null,
    settings: null,
    confirmationDialog: {},
    colourOverride: true,
    coloursConfig: null,
    colourMapping: {},
    menuState: null,
    menuArguments: null,
    tutorialPage: 0,
    menuStateChat: null,
    menuArgumentsChat: null,
    username: null,
    roles: null,
    userCredits: null,
    isImpersonating: null,
    userIsEstablishedPlayer: null,
    productionTick: null,
    unreadMessages: null,
    badges: [],
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

      eventBus.emit(MenuEventBusEventNames.OnMenuRequested, {
        menuState: null,
        menuArguments: null as unknown
      })
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
    // -------

    // TUTORIAL
    setTutorialPage (state: State, page) {
      state.tutorialPage = page || 0
    },
    clearTutorialPage (state) {
      state.tutorialPage = 0
    },
    // -------

    setCarrierSpecialists (state: State, carrierSpecialists) {
      state.carrierSpecialists = carrierSpecialists;
    },
    setStarSpecialists (state: State, starSpecialists) {
      state.starSpecialists = starSpecialists;
    },

    setUserId (state: State, userId) {
      state.userId = userId
    },
    clearUser (state) {
      state.userId = null;
      state.user = null;
    },

    setUsername (state: State, username) {
      state.username = username
    },
    clearUsername (state) {
      state.username = null
    },

    setUser (state: State, user) {
      state.user = user;
    },

    setRoles (state: State, roles) {
      state.roles = roles
    },
    clearRoles (state) {
      state.roles = null
    },

    setUserCredits (state: State, credits) {
      state.userCredits = credits
    },
    clearUserCredits (state) {
      state.userCredits = null
    },

    setIsImpersonating (state: State, isImpersonating) {
      state.isImpersonating = isImpersonating;
    },
    clearIsImpersonating (state) {
      state.isImpersonating = null;
    },

    setUserIsEstablishedPlayer (state: State, isEstablishedPlayer) {
      state.userIsEstablishedPlayer = isEstablishedPlayer
    },
    clearUserIsEstablishedPlayer (state) {
      state.userIsEstablishedPlayer = null
    },

    setTick (state: State, tick) {
      state.tick = tick
    },
    setProductionTick (state: State, tick) {
      state.productionTick = tick
    },

    setGame (state: State, game) {
      state.game = game
      state.colourMapping = {...GameHelper.getColourMapping(game)};
    },
    clearGame (state) {
      state.game = null
      state.cachedConversationComposeMessages = {}
      state.currentConversation = null;
      state.carrierSpecialists = null;
      state.starSpecialists = null;
      state.colourOverride = true;
      state.colourMapping = {};
    },

    setColourOverride (state: State, value) {
      state.colourOverride = value

      if (state.game) {
        eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadGame, {});
      }
    },

    setSettings (state: State, settings) {
      state.settings = settings
    },
    clearSettings (state) {
      state.settings = null
    },
    setConfirmationDialogSettings (state: State, settings) {
      state.confirmationDialog = settings
    },

    setUnreadMessages (state: State, count) {
      state.unreadMessages = count
    },
    clearUnreadMessages (state) {
      state.unreadMessages = null
    },

    openConversation (state: State, data: string) {
      state.currentConversation = {
        id: data,
        text: state.cachedConversationComposeMessages[data] || ''
      }
    },
    closeConversation (state: State) {
      if (state.currentConversation) {
        const id = state.currentConversation.id;
        state.cachedConversationComposeMessages[id] = state.currentConversation.text
        state.currentConversation = null
      }
    },
    updateCurrentConversationText (state: State, data) {
      state.currentConversation!.text = data
    },
    resetCurrentConversationText (state: State, data) {
      state.currentConversation!.text = ''
    },
    setMentions (state: State, data) {
      state.mentionReceivingElement = data.element;
      state.mentionCallbacks = data.callbacks;
    },
    resetMentions (state) {
      state.mentionReceivingElement = null;
      state.mentionCallbacks = null;
    },
    playerClicked (state: State, data) {
      if (state.mentionCallbacks && state.mentionCallbacks.player) {
        state.mentionCallbacks.player(data.player)
      } else {
        data.permitCallback(data.player)
      }
    },
    starClicked (state: State, data) {
      if (state.mentionCallbacks && state.mentionCallbacks.star) {
        state.mentionCallbacks.star(data.star)
      } else {
        data.permitCallback(data.star)
      }
    },
    starRightClicked (state: State, data) {
      if (state.mentionCallbacks && state.mentionCallbacks.player) {
        state.mentionCallbacks.player(data.player)
      } else {
        data.permitCallback(data.star)
      }
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

      player.ready = true
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
      let player = GameHelper.getUserPlayer(state.game);

      let newScience = 0;

      data.stars.forEach(s => {
        let star = GameHelper.getStarById(state.game, s.starId);

        if (data.infrastructureType === 'science') {
          newScience += (s.infrastructure - s.infrastructureCurrent) * (star.specialistId === 11 ? 2 : 1); // Research Station
        }

        star.infrastructure[data.infrastructureType] = s.infrastructure

        if (star.upgradeCosts && s.nextInfrastructureCost) {
          star.upgradeCosts[data.infrastructureType] = s.nextInfrastructureCost
        }

        if (s.manufacturing != null) {
          player.stats.newShips -= star.manufacturing // Deduct old value
          star.manufacturing = s.manufacturing
          player.stats.newShips += s.manufacturing // Add the new value
        }

        eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
      })

      player.credits -= data.cost
      player.stats.newShips = Math.round((player.stats.newShips + Number.EPSILON) * 100) / 100

      if (data.currentResearchTicksEta) {
        player.currentResearchTicksEta = data.currentResearchTicksEta
      }

      if (data.nextResearchTicksEta) {
        player.nextResearchTicksEta = data.nextResearchTicksEta
      }

      // Update player total stats.
      switch (data.infrastructureType) {
        case 'economy':
          player.stats.totalEconomy += data.upgraded
          break;
        case 'industry':
          player.stats.totalIndustry += data.upgraded
          break;
        case 'science':
          player.stats.totalScience += (newScience * state.game!.constants.research.sciencePointMultiplier)
          break;
      }
    },
    gameBulkActionAdded(state: State, data) {
      let player = GameHelper.getUserPlayer(state.game)
      player.scheduledActions.push(data);
    },
    gameBulkActionTrashed(state: State, data) {
      let player = GameHelper.getUserPlayer(state.game)
      player.scheduledActions = player.scheduledActions.filter(a => a._id != data._id)
    },
    gameStarWarpGateBuilt (state: State, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      star.warpGate = true

      GameHelper.getUserPlayer(state.game).credits -= data.cost

      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
    },
    gameStarWarpGateDestroyed (state: State, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      star.warpGate = false

      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
    },
    gameStarCarrierBuilt (state: State, data) {
      let carrier = GameHelper.getCarrierById(state.game, data.carrier._id)

      if (!carrier) {
        state.game!.galaxy.carriers.push(data.carrier)
      }

      let star = GameHelper.getStarById(state.game, data.carrier.orbiting)
      star.ships = data.starShips

      let userPlayer = GameHelper.getUserPlayer(state.game)
      userPlayer.credits -= star.upgradeCosts.carriers
      userPlayer.stats.totalCarriers++

      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, { carrier: data.carrier });
    },
    gameStarCarrierShipTransferred (state: State, data) {
      let star = GameHelper.getStarById(state.game, data.starId)
      let carrier = GameHelper.getCarrierById(state.game, data.carrierId)

      star.ships = data.starShips
      carrier.ships = data.carrierShips

      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, { carrier });
    },
    gameStarAllShipsTransferred (state: State, data) {
      let star = GameHelper.getStarById(state.game, data.star._id)

      star.ships = data.star.ships

      data.carriers.forEach(carrier => {
        let mapObjectCarrier = GameHelper.getCarrierById(state.game, carrier._id)

        mapObjectCarrier.ships = carrier.ships
      })
    },
    gameStarAbandoned (state: State, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      let player = GameHelper.getPlayerById(state.game!, star.ownedByPlayerId)!
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
    gameCarrierScuttled (state: State, data) {
      let carrier = GameHelper.getCarrierById(state.game, data.carrierId)
      let star = GameHelper.getStarById(state.game, carrier.orbiting)
      let player = GameHelper.getPlayerById(state.game!, carrier.ownedByPlayerId)!

      player.stats!.totalCarriers--

      if (carrier.specialistId) {
        player.stats!.totalSpecialists--
      }

      eventBus.emit(GameCommandEventBusEventNames.GameCommandRemoveCarrier, { carrier });

      state.game!.galaxy.carriers.splice(state.game!.galaxy.carriers.indexOf(carrier), 1)

      if (star) {
        eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
      }
    },
    [PlayerMutationNames.PlayerDebtSettled] (state: State, data) {
      let player = GameHelper.getUserPlayer(state.game)

      if (data.creditorPlayerId === player._id) {
        if (data.ledgerType === 'credits') {
          player.credits += data.amount
        } else {
          player.creditsSpecialists += data.amount
        }
      }
    },
    starSpecialistHired (state: State, data) {
      let star = GameHelper.getStarById(state.game, data.starId)

      star.specialistId = data.specialist.id
      star.specialist = data.specialist

      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
    },
    carrierSpecialistHired (state: State, data) {
      let carrier = GameHelper.getCarrierById(state.game, data.carrierId)

      carrier.specialistId = data.specialist.id
      carrier.specialist = data.specialist

      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, { carrier });
    },

    gameStarEconomyUpgraded (state: State, data) {
      data.type = 'economy'
      const star = GameHelper.starInfrastructureUpgraded(state.game, data)
      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
    },
    gameStarIndustryUpgraded (state: State, data) {
      data.type = 'industry'
      const star = GameHelper.starInfrastructureUpgraded(state.game, data)
      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
    },
    gameStarScienceUpgraded (state: State, data) {
      data.type = 'science'
      const star = GameHelper.starInfrastructureUpgraded(state.game, data)
      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
    },

    internalAddColourMapping (state: State, data) {
      state.colourMapping = {
        ...state.colourMapping,
        [data.playerId]: data.colour
      };
    },
    setColoursConfig (state: State, data) {
      state.coloursConfig = data;
    },
    setBadges(state: State, badges: Badge[]) {
      state.badges = badges;
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
    },
    async loadColourData ({ commit, state }: { commit: any, state: State }) {
      if (state.userId) {
        const resp = await ColourService.listColours();
        commit('setColoursConfig', resp.data);
      }
    },
    async confirm ({ commit, state }, data) {
      // @ts-ignore
      const modal = new bootstrap.Modal(window.$('#confirmModal'), {})
      const close = async () => {
        modal.toggle()
        await new Promise((resolve, reject) => setTimeout(resolve, 400));
      }
      return new Promise((resolve, reject) => {
        const settings = {
          confirmText: data.confirmText || 'Yes',
          cancelText: data.cancelText || 'No',
          hideCancelButton: Boolean(data.hideCancelButton),
          cover: Boolean(data.cover),
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
        modal.toggle()
      })
    },
    async addColourMapping ({ commit, state }, data) {
      console.warn('Adding colour mapping', data);

      await ColourService.addColour(state.game._id, data);
      commit('internalAddColourMapping', data);

      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadGame, {});
    },
    async verify({ commit, state }) {
      try {
        const response = await ApiAuthService.verify();

        if (response.status === 200) {
          if (response.data._id) {
            commit('setUserId', response.data._id)
            commit('setUsername', response.data.username)
            commit('setRoles', response.data.roles)
            commit('setUserCredits', response.data.credits)

            if (!state.user || state.user?._id !== response.data._id) {
              const resp2 = await ApiUserService.getMyUserInfo();
              if (resp2.status === 200) {
                commit('setUser', resp2.data);
              } else {
                console.error('Failed to get user info', resp2);
              }
            }

            userClientSocketEmitter.emitJoined();
            return true;
          }
        }

        return false;
      } catch (err) {
        console.error(err);
        return false;
      }
    },
    async getBadges({ commit, state }) {
      if (state.badges?.length) {
        return state.badges;
      }

      const response = await getBadges(httpClient)();
      if (!isError(response)) {
        commit('setBadges', response.data);
        return response.data;
      }
    }
  },
  getters: {
    getConversationMessage: (state) => (conversationId) => {
      return state.cachedConversationComposeMessages[conversationId] || ''
    },
    getColourForPlayer: (state) => (playerId) => {
      let colour: {
        alias: string;
        value: string;
    } | null = null;

      if (state.colourOverride) {
        colour = state.colourMapping?.[playerId] || GameHelper.getPlayerById(state.game, playerId)!.colour;
      } else {
        colour = GameHelper.getPlayerById(state.game, playerId)!.colour
      }

      if (colour != null) {
        colour.value = GameHelper.getFriendlyColour(colour.value);
      }

      return colour;
    }
  }
  })
}
