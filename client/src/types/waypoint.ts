export type TempWaypoint = {
  destination: string;
  action: string;
  actionShips: number;
  delayTicks: number;
  source: string | undefined | null;
}
