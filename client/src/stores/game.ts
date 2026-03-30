import { ref, readonly, inject } from 'vue';
import { defineStore } from 'pinia';
import type {Game} from "@/types/game";
import {
  type BulkUpgradeReport, type CarrierBuildReport,
  type GameState, type InfrastructureUpgradeReport, LedgerType,
  type PlayerScheduledActions, type ShipTransferReport,
  type Specialist,
  type UserGameSettings,
  type WarpgateBuildReport
} from "@solaris-common";
import {eventBusInjectionKey} from "@/eventBus";
import MenuEventBusEventNames from "@/eventBusEventNames/menu";
import {useColourStore} from "@/stores/colour";
import GameMutationNames from "@/mutationNames/gameMutationNames";
import PlayerMutationNames from "@/mutationNames/playerMutationNames";
import GameHelper from "@/services/gameHelper";
import GameCommandEventBusEventNames from "@/eventBusEventNames/gameCommand";
import {listCarrierForGame, listStarForGame} from "@/services/typedapi/specialist";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";

type PlayerJoinedData = {
  playerId: string,
  alias: string,
  avatar: string,
};

export const useGameStore = defineStore('game', () => {
  const game = ref<Game | null>(null);
  const tick = ref(0);
  const starSpecialists = ref<Specialist[] | null>(null);
  const carrierSpecialists = ref<Specialist[] | null>(null);
  const settings = ref<UserGameSettings | null>(null);
  const menuState = ref<string | null>(null);
  const menuArguments = ref<any>(null);
  const menuStateChat = ref<string | null>(null);
  const menuArgumentsChat = ref<any>(null);
  const productionTick = ref<number | null>(null);
  const unreadMessages = ref<number | null>(null);

  const httpClient = inject(httpInjectionKey)!;
  const eventBus = inject(eventBusInjectionKey)!;
  const colourStore = useColourStore();

  const setMenuState = (newMenuState: { state: string, args: any }) => {
    if (newMenuState.state === menuState.value && newMenuState.args === menuArguments.value) {
      menuArguments.value = null;
      menuState.value = null;
    } else {
      menuArguments.value = newMenuState.args;
      menuState.value = newMenuState.state;
    }

    eventBus.emit(MenuEventBusEventNames.OnMenuRequested, { menuState: menuState.value, menuArguments: menuArguments.value });
  };

  const clearMenuState = () => {
    menuState.value = null;
    menuArguments.value = null;

    eventBus.emit(MenuEventBusEventNames.OnMenuRequested, {
      menuState: null,
      menuArguments: null,
    } as any);
  };

  const setMenuStateChat = (newState: { args: any, state: string }) => {
    menuArgumentsChat.value = newState.state;
    menuStateChat.value = newState.args;
  };

  const clearMenuStateChat = () => {
    menuStateChat.value = null;
    menuArgumentsChat.value = null;
  };

  const setTick = (newTick: number) => {
    tick.value = newTick;
  };

  const setProductionTick = (newProdTick: number) => {
    productionTick.value = newProdTick;
  };

  const setGame = (newGame: Game) => {
    game.value = newGame;
    colourStore.setColourMappingFromGame(newGame);
  };

  const clearGame = () => {
    game.value = null;
    carrierSpecialists.value = null;
    starSpecialists.value = null;
    colourStore.clearColourState();
  };

  const setSettings = (newSettings: UserGameSettings) => {
    settings.value = newSettings;
  };

  const setUnreadMessages = (count: number) => {
    unreadMessages.value = count;
  };

  const gameStarBulkUpgraded = (data: BulkUpgradeReport<string>) => {
    const player = GameHelper.getUserPlayer(game.value!)!;

    let newScience = 0;

    data.stars.forEach(s => {
      const star = GameHelper.getStarById(game.value!, s.starId)!;

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
        player.stats!.totalEconomy += data.upgraded;
        break;
      case 'industry':
        player.stats!.totalIndustry += data.upgraded;
        break;
      case 'science':
        player.stats!.totalScience += (newScience * game.value!.constants.research.sciencePointMultiplier)
        break;
    }
  };

  const gameBulkActionAdded = (data: PlayerScheduledActions<string>) => {
    const player = GameHelper.getUserPlayer(game.value!)!;
    player.scheduledActions.push(data);
  };

  const gameBulkActionTrashed = (data: PlayerScheduledActions<string>) => {
    const player = GameHelper.getUserPlayer(game.value!)!;
    player.scheduledActions = player.scheduledActions.filter(a => a._id != data._id)
  };

  const gameStarWarpGateBuilt = (data: WarpgateBuildReport<string>) => {
    const star = GameHelper.getStarById(game.value!, data.starId)!;
    star.warpGate = true;
    GameHelper.getUserPlayer(game.value!)!.credits -= data.cost;
    eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
  };

  const gameStarWarpGateDestroyed = (data: { starId: string }) => {
    const star = GameHelper.getStarById(game.value!, data.starId)!;
    star.warpGate = false;
    eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
  };

  const gameStarCarrierBuilt = (data: CarrierBuildReport<string>) => {
    const carrier = GameHelper.getCarrierById(game.value!, data.carrier._id);

    if (!carrier) {
      game.value!.galaxy.carriers.push(data.carrier);
    }

    const star = GameHelper.getStarById(game.value!, data.carrier.orbiting!)!;
    star.ships = data.starShips;

    const userPlayer = GameHelper.getUserPlayer(game.value!)!;
    userPlayer.credits -= star.upgradeCosts!.carriers || 0;
    userPlayer.stats!.totalCarriers++

    eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
    eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, { carrier: data.carrier });
  };

  const gameStarCarrierShipTransferred = (data: { starId: string, carrierId: string, starShips: number, carrierShips: number }) => {
    const star = GameHelper.getStarById(game.value!, data.starId)!;
    const carrier = GameHelper.getCarrierById(game.value!, data.carrierId)!;

    star.ships = data.starShips
    carrier.ships = data.carrierShips

    eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
    eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, { carrier });
  };

  const gameStarAllShipsTransferred = (data: ShipTransferReport<string>) => {
    const star = GameHelper.getStarById(game.value!, data.star._id)!;

    star.ships = data.star.ships;

    data.carriers.forEach(carrier => {
      const mapObjectCarrier = GameHelper.getCarrierById(game.value!, carrier._id)!

      mapObjectCarrier.ships = carrier.ships;
    });
  };

  const gameStarAbandoned = (data: { starId: string }) => {
    const star = GameHelper.getStarById(game.value!, data.starId)!;

    const player = GameHelper.getPlayerById(game.value!, star.ownedByPlayerId!)!;
    player.stats!.totalStars--;

    star.ownedByPlayerId = null;
    star.ships = 0;

    // Redraw and remove carriers
    const carriers = game.value!.galaxy.carriers.filter(x => x.orbiting && x.orbiting === star._id && x.ownedByPlayerId === player._id);

    carriers.forEach(c => {
      eventBus.emit(GameCommandEventBusEventNames.GameCommandRemoveCarrier, { carrier: c });
      game.value!.galaxy.carriers.splice(game.value!.galaxy.carriers.indexOf(c), 1);
    });

    // Redraw the star
    eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
  };

  const gameStarEconomyUpgraded = (data: InfrastructureUpgradeReport<string>) => {
    const star = GameHelper.starInfrastructureUpgraded(game.value!, { type: 'economy', ...data });
    eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
  };

  const gameStarIndustryUpgraded = (data: InfrastructureUpgradeReport<string>) => {
    const star = GameHelper.starInfrastructureUpgraded(game.value!, { type: 'industry', ...data });
    eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
  };

  const gameStarScienceUpgraded = (data: InfrastructureUpgradeReport<string>) => {
    const star = GameHelper.starInfrastructureUpgraded(game.value!, { type: 'science', ...data });
    eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, { star });
  };

  const loadSpecialistData = async (gameId: string) => {
    const requests = [
      listCarrierForGame(httpClient)(gameId),
      listStarForGame(httpClient)(gameId),
    ];

    const responses = await Promise.all(requests)

    const carrierResponse = responses[0];

    if (isOk(carrierResponse)) {
      carrierSpecialists.value = carrierResponse.data;
    } else {
      console.error(formatError(carrierResponse));
    }

    const starResponse = responses[1];

    if (isOk(starResponse)) {
      starSpecialists.value = starResponse.data;
    } else {
      console.error(formatError(starResponse));
    }
  };

  const socketMutations = {
    [GameMutationNames.GameStarted]: (data: { state: GameState<string> }) => {
      game.value!.state = data.state;
    },
    [PlayerMutationNames.GamePlayerJoined]: (data: PlayerJoinedData) => {
      const player = GameHelper.getPlayerById(game.value!, data.playerId)!;

      player.isOpenSlot = false;
      player.alias = data.alias;
      player.avatar = data.avatar;
      player.defeated = false;
      player.defeatedDate = null;
      player.afk = false;
    },
    [PlayerMutationNames.GamePlayerQuit]: (data: { playerId: string }) => {
      const player = GameHelper.getPlayerById(game.value!, data.playerId)!;

      player.isOpenSlot = true;
      player.alias = 'Empty Slot';
      player.avatar = null;
    },
    [PlayerMutationNames.GamePlayerReady]: (data: { playerId: string }) => {
      const player = GameHelper.getPlayerById(game.value!, data.playerId)!;

      player.ready = true;
    },
    [PlayerMutationNames.GamePlayerNotReady]: (data: { playerId: string }) => {
      const player = GameHelper.getPlayerById(game.value!, data.playerId)!;

      player.ready = false;
    },
    [PlayerMutationNames.GamePlayerConcededDefeat]: (data: { playerId: string }) => {
      const player = GameHelper.getPlayerById(game.value!, data.playerId)!;

      player.defeated = true;
    },
    [PlayerMutationNames.GamePlayerReadyToQuit](data: { playerId: string | null }) {
      if (data.playerId !== null) {
        const player = GameHelper.getPlayerById(game.value!, data.playerId)!;

        player.readyToQuit = true;
      }

      game.value!.state.readyToQuitCount = (game.value!.state.readyToQuitCount ?? 0) + 1;
    },
    [PlayerMutationNames.GamePlayerNotReadyToQuit](data: { playerId: string | null }) {
      if (data.playerId !== null) {
        const player = GameHelper.getPlayerById(game.value!, data.playerId)!;

        player.readyToQuit = false;
      }

      game.value!.state.readyToQuitCount = (game.value!.state.readyToQuitCount ?? 0) - 1;
    },
    [PlayerMutationNames.PlayerDebtSettled]: (data: { debtorPlayerId: string,
      creditorPlayerId: string,
      amount: number,
      ledgerType: LedgerType, }) => {
      const player = GameHelper.getUserPlayer(game.value!)!;

      if (data.creditorPlayerId === player._id) {
        if (data.ledgerType === 'credits') {
          player.credits += data.amount;
        } else {
          player.creditsSpecialists += data.amount;
        }
      }
    },
  };

  return {
    game,
    tick: readonly(tick),
    starSpecialists: readonly(starSpecialists),
    carrierSpecialists: readonly(carrierSpecialists),
    settings: readonly(settings),
    menuState: readonly(menuState),
    menuArguments: readonly(menuArguments),
    menuStateChat: readonly(menuStateChat),
    menuArgumentsChat: readonly(menuArgumentsChat),
    productionTick: readonly(productionTick),
    unreadMessages: readonly(unreadMessages),
    setMenuState,
    clearMenuState,
    setTick,
    setProductionTick,
    setGame,
    clearGame,
    setSettings,
    setUnreadMessages,
    gameStarBulkUpgraded,
    gameStarAbandoned,
    gameStarAllShipsTransferred,
    gameStarCarrierBuilt,
    gameStarEconomyUpgraded,
    gameStarCarrierShipTransferred,
    gameStarIndustryUpgraded,
    gameStarScienceUpgraded,
    gameStarWarpGateBuilt,
    gameStarWarpGateDestroyed,
    socketMutations,
    loadSpecialistData,
    gameBulkActionAdded,
    gameBulkActionTrashed,
    setMenuStateChat,
    clearMenuStateChat,
  };
});

export type GameStore = ReturnType<typeof useGameStore>;
