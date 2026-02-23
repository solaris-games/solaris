import type {IntelPlayer} from "@solaris-common";

export type DataSet = {
  label: string;
  borderColor: string;
  fill: boolean;
  pointRadius: number;
  borderWidth: number;
  pointHitRadius: number;
  data: number[];
}

export type DataCollection = {
  labels: string[];
  datasets: DataSet[];
}

export type PlayerFilter = {
  enabled: boolean,
  playerId: string,
  alias: string,
  shape: string,
  defeated: boolean,
  colour: string
};

export type IntelType = keyof IntelPlayer<string>['statistics'] | keyof IntelPlayer<string>['research'];
