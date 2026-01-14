import { compareDesc } from "date-fns";

// We do not account for anything longer than weeks because after that things get messy
export type Duration = {
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

const MINUTE_SECONDS = 60;
const HOUR_SECONDS = 60 * MINUTE_SECONDS;
const DAY_SECONDS = 24 * HOUR_SECONDS;
const WEEK_SECONDS = 7 * DAY_SECONDS;

export const toSeconds = (duration: Duration) => {
  return ((duration.weeks || 0) * WEEK_SECONDS) +
    ((duration.days || 0) * DAY_SECONDS) +
    ((duration.hours || 0) * HOUR_SECONDS) +
    ((duration.minutes || 0) * MINUTE_SECONDS) +
    ((duration.seconds || 0));
}

export const normalize = (duration: Duration): Duration => {
  let seconds = toSeconds(duration);
  const norm = {} as Duration;

  norm.weeks = Math.floor(seconds / WEEK_SECONDS);
  seconds -= seconds % WEEK_SECONDS;

  norm.days = Math.floor(seconds / DAY_SECONDS);
  seconds -= norm.days * DAY_SECONDS;

  norm.hours = Math.floor(seconds / HOUR_SECONDS);
  seconds -= norm.hours * HOUR_SECONDS;

  norm.minutes = Math.floor(seconds / MINUTE_SECONDS);
  seconds -= norm.minutes * MINUTE_SECONDS;

  norm.seconds = seconds;

  return norm;
};

export const between = (date1: Date, date2: Date): Duration => {
  if (compareDesc(date1, date2) !== 1) {
    return { seconds: 0 };
  }

  return normalize({
    seconds: date2.getTime() - date1.getTime(),
  });
};

export const formatDuration = (duration: Duration): string => {
  const val2 = (v: number | undefined) => (v || 0).toString().padStart(2, '0');

  let str = `${val2(duration.hours)}:${val2(duration.minutes)}:${val2(duration.seconds)}`;

  if (duration.days && duration.days > 0) {
    str = `${duration.days}d ` + str;
  }

  if (duration.weeks && duration.weeks > 0) {
    str = `${duration.weeks}w ` + str;
  }

  return str;
};
