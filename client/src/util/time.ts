import { add } from 'date-fns';
import type {Carrier, Game} from "@/types/game";
import GameHelper from "@/services/gameHelper";
import {between, type Duration, formatDuration as formatRealDuration, normalize, toSeconds} from "@/util/duration";

export const addTicksToTime = (ticks: number, speedInSeconds: number, relativeTo: Date): Date => {
  return add(relativeTo, { seconds: ticks * speedInSeconds });
};

export const addTicksToCurrentTime = (ticks: number, speedInSeconds: number) => addTicksToTime(ticks, speedInSeconds, new Date());

export const addTicksToLastTick = (game: Game, ticks: number): Date | null => {
  const date = game.state.lastTickDate;

  if (!date || game.settings.gameTime.gameType !== 'realTime') {
    return null;
  }

  return addTicksToTime(ticks, game.settings.gameTime.speed, date);
};

const formatDuration = (duration: Duration): string => {
  if (toSeconds(duration) <= 0) {
    return `Pending...`;
  }

  return formatRealDuration(duration);
};

export const getCountdownTimeString = (date: Date): string => {
  return formatDuration(between(new Date(), date));
};

export const getCountdownTimeStringByTicks = (game: Game, ticks: number): string => {
  if (game.settings.gameTime.gameType === 'realTime' && !GameHelper.isGameFinished(game)) {
    const time = addTicksToLastTick(game, ticks);

    if (!time) {
      return `${ticks} T`;
    }

    const duration = between(new Date(), time);

    if (toSeconds(duration) <= 0) {
      return `Pending...`;
    }

    return `${formatDuration(duration)} (${ticks} T)`;
  }

  return `${ticks} T`;
};

export const getCountdownTimeForProductionCycle = (game: Game) => {
  if (!game.state.lastTickDate) {
    return `N/A`;
  }

  const ticksToProduction = GameHelper.getTicksToProduction(game, game.state.tick, game.state.productionTick);

  return addTicksToTime(ticksToProduction, game.settings.gameTime.speed, game.state.lastTickDate);
}

export const ticksToDuration = (game: Game, ticks: number): Duration => {
  const seconds = ticks * game.settings.gameTime.speed;

  return normalize({ seconds });
}

export const getCountdownTimeStringWithETA = (game: Game, ticks: number): string => {
  return `${getCountdownTimeStringByTicks(game, ticks)} - ETA: ${game.state.tick + ticks}`;
};

export const getCountdownTimeStringForTurnTimeout = (game: Game): string => {
  if (game.settings.gameTime.gameType === 'realTime' && !GameHelper.isGameFinished(game)) {
    const endTime = add(new Date(), { seconds: game.settings.gameTime.maxTurnWait });

    const duration = between(new Date(), endTime);
    return formatDuration(duration);
  }

  return `N/A`;
}
