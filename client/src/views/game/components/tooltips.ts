import type { TooltipData, TooltipService } from "@solaris/map-rendering";
import type { Carrier, Game, Star } from "@/types/game";
import GameHelper from "@/services/gameHelper";
import { getCountdownTimeStringByTicks } from "@/util/time";

export class GameTooltips implements TooltipService {
  getCarrier(game: Game, carrier: Carrier): TooltipData | undefined {
    const isOwnedByUserPlayer = GameHelper.isOwnedByUserPlayer(game, carrier);

    const detail = [
      `⏱️ ` + getCountdownTimeStringByTicks(game, carrier.ticksEta || 0),
    ];

    if (isOwnedByUserPlayer) {
      detail.push(
        `${carrier.waypointsLooped ? "🔄" : "📍"} ${carrier.waypoints.length} waypoint${carrier.waypoints.length !== 1 ? "s" : ""}`,
      );
    }

    return {
      player: GameHelper.getPlayerById(game, carrier.ownedByPlayerId!)!,
      location: carrier.location,
      detail,
      offset: {
        relative: true,
        x: 6,
        y: 2,
      },
    };
  }

  getStar(game: Game, star: Star): TooltipData | undefined {
    if (!star.ownedByPlayerId) {
      return undefined;
    }

    const carriers = GameHelper.getCarriersOrbitingStar(game, star);

    if (!carriers.length) {
      return undefined;
    }

    let detail: string[] = [];

    if (star.ships != null && star.ships > 0) {
      detail.push(`⭐ ${star.ships} garrisoned\n`);
    }

    const carrierStrings = carriers.map((carrier) => {
      const isOwnedByUserPlayer = GameHelper.isOwnedByUserPlayer(game, carrier);

      let result =
        `\n${carrier.name}` +
        `\n 🚀 ${carrier.ships || "???"} ship${carrier.ships !== 1 ? "s" : ""}`;

      if (isOwnedByUserPlayer) {
        result += `\n ${carrier.waypointsLooped ? "🔄" : "📍"} ${carrier.waypoints.length} waypoint${carrier.waypoints.length !== 1 ? "s" : ""}`;
      }

      if (carrier.specialist && carrier.specialist.name) {
        result += `\n 🧑‍🚀 ${carrier.specialist.name}`;
      }

      return result;
    });

    carrierStrings[0] = carrierStrings[0].trim();

    detail = detail.concat(carrierStrings);

    return {
      player: GameHelper.getPlayerById(game, star.ownedByPlayerId!)!,
      location: star.location,
      detail,
      offset: {
        relative: false,
        x: 0,
        y: 6,
      },
    };
  }
}
