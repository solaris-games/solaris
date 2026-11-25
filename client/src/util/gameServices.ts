import type { InjectionKey } from "vue";

import { inject } from "vue";
import { initialize, type ServiceProvider } from "@/services/services";
import GameHelper from "@/services/gameHelper";
import {
  type Carrier,
  type Game,
  ShipService,
  type Star,
} from "@solaris/common";
import type { GameStore } from "@/stores/game";

export const gameServicesKey: InjectionKey<ServiceProvider> =
  Symbol("gameServices");

export const createGameServices = (store: GameStore) => {
  const starService = {
    getById: (game: Game<string>, id: string) =>
      GameHelper.getStarById(game, id)!,
    listStarsOwnedByPlayer: (stars: Star<string>[], playerId: string) =>
      stars.filter((st) => st.ownedByPlayerId === playerId),
  };

  const specialistService = {
    getByIdStar: (id: number) =>
      store.starSpecialists!.find((s) => s.id === id)!,
    getByIdCarrier: (id: number) =>
      store.carrierSpecialists!.find((s) => s.id === id)!,
  };

  const diplomacyService = {
    isFormalAlliancesEnabled: (game: Game<string>) =>
      game.settings.diplomacy.enabled === "enabled",
    isDiplomaticStatusToPlayersAllied: (
      game: Game<string>,
      playerId: string,
      otherPlayerIds: string[],
    ) => {
      const player = GameHelper.getPlayerById(game, playerId)!;

      return player.diplomacy.every((status) => {
        const isRelevant = otherPlayerIds.includes(status.playerId);

        return !isRelevant || status.status === "allies";
      });
    },
  };

  const carrierService = {
    listCarriersOwnedByPlayer: (
      carriers: Carrier<string>[],
      playerId: string,
    ) => carriers.filter((c) => c.ownedByPlayerId === playerId),
  };

  return initialize(
    starService,
    specialistService,
    diplomacyService,
    carrierService,
  );
};

export const useGameServices = () => {
  return inject(gameServicesKey)!;
};
