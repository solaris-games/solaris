import type { InjectionKey } from "vue";
import type {State} from "@/store";
import type { Store } from "vuex";
import { inject } from "vue";
import {initialize, type ServiceProvider} from "@/services/services";
import GameHelper from "@/services/gameHelper";
import type {Game} from "@solaris-common";

export const gameServicesKey: InjectionKey<ServiceProvider> = Symbol('gameServices');

export const createGameServices = (store: Store<State>) => {
  const starService = {
    getById: (game: Game<string>, id: string) => GameHelper.getStarById(game, id)!,
  };

  const specialistService = {
    getByIdStar: (id: number) => store.state.starSpecialists.find((s) => s.id === id)!,
    getByIdCarrier: (id: number) => store.state.carrierSpecialists.find((s) => s.id === id)!,
  };

  const diplomacyService = {
    isFormalAlliancesEnabled: (game: Game<string>) => game.settings.diplomacy.enabled === 'enabled',
    isDiplomaticStatusToPlayersAllied: (game: Game<string>, playerId: string, otherPlayerIds: string[]) => {
      const player = GameHelper.getPlayerById(game, playerId)!;

      return player.diplomacy.every((status) => {
        const isRelevant = otherPlayerIds.includes(status.playerId);

        return !isRelevant || status.status === 'allies';
      });
    },
  };

  return initialize(starService, specialistService, diplomacyService);
}

export const useGameServices = () => {
  return inject(gameServicesKey)!;
}
