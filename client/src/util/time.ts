import { add } from 'date-fns';
import type {Game} from "@/types/game";
import GameHelper from "@/services/gameHelper";
import {
  between,
  betweenAbs,
  type Duration,
  formatDuration as formatRealDuration,
  normalize,
  toSeconds
} from "@/util/duration";
import {
  type GameInfoState,
  type GameSettingsGalaxyBase, type GameSettingsGameTime, type ListGameSettingsGeneral
} from "@solaris-common";

type TGame = {
  settings: {
    general: ListGameSettingsGeneral<string>,
    gameTime: GameSettingsGameTime,
    galaxy: GameSettingsGalaxyBase,
  },
  state: GameInfoState<string>,
}

export const addTicksToTime = (ticks: number, speedInSeconds: number, relativeTo: Date): Date => {
  return add(relativeTo, { seconds: ticks * speedInSeconds });
};

// for non-started or paused games we want the current time as base
const getLastTickDate = (game: TGame) => {
  if (!game.state.lastTickDate) {
    return null;
  }

  const isBehind = game.state.lastTickDate.getTime() + (game.settings.gameTime.speed * 1000) < Date.now();

  if (GameHelper.isGameInProgress(game) && !isBehind) {
    return game.state.lastTickDate;
  }

  return new Date();
}

export const addTicksToLastTick = (game: Game, ticks: number): Date | null => {
  const date = getLastTickDate(game);

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

const formatTick = (ticks: number): string => {
  return ticks === 1 ?  `1 tick` : `${ticks} ticks`;
};

export const getCountdownTimeStringByTicks = (game: Game, ticks: number): string => {
  if (game.settings.gameTime.gameType === 'realTime' && !GameHelper.isGameFinished(game)) {
    const time = addTicksToLastTick(game, ticks);

    if (!time) {
      return formatTick(ticks);
    }

    const duration = betweenAbs(new Date(), time);

    if (toSeconds(duration) <= 0) {
      return `Pending...`;
    }

    return `${formatDuration(duration)} (${formatTick(ticks)})`;
  }

  return formatTick(ticks);
};

export const getCountdownTimeForProductionCycle = (game: TGame): Date | null => {
  const lastTickDate = getLastTickDate(game);

  if (!lastTickDate) {
    return null;
  }

  const ticksToProduction = GameHelper.getTicksToProduction(game, game.state.tick, game.state.productionTick);

  return addTicksToTime(ticksToProduction, game.settings.gameTime.speed, lastTickDate);
}

export const ticksToDuration = (game: Game, ticks: number): Duration => {
  const seconds = ticks * game.settings.gameTime.speed;

  return normalize({ seconds });
};

export const getCountdownTimeStringWithETA = (game: Game, ticks: number): string => {
  const relative = getCountdownTimeStringByTicks(game, ticks);

  return `${relative} - ETA: Tick ${game.state.tick + ticks}`;
};

export const getTurnTimeoutTime = (game: TGame): Date | null => {
  if (game.settings.gameTime.gameType === 'turnBased' && game.state.lastTickDate && !GameHelper.isGameFinished(game)) {
    return add(game.state.lastTickDate, { minutes: game.settings.gameTime.maxTurnWait });
  }

  return null;
};

export const getCountdownTimeStringForTurnTimeout = (game: TGame): string => {
  const time = getTurnTimeoutTime(game);

  if (!time) {
    return `N/A`;
  }

  const duration = between(new Date(), time);
  return formatDuration(duration);
};
