import type {Player, Team} from "@solaris-common";

export type TeamLeaderboardData = {
  team: Team<string>,
  players: Player<string>[],
  totalStars: number,
  totalHomeStars: number,
}
