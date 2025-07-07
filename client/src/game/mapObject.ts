import type { Location, MapObject as MapObjectData } from "@solaris-common";
import type { Container } from "pixi.js";

export interface MapObject {
  getLocation(): Location;
  getContainer(): Container;
  onZoomChanging(zoomPercent: number): void;
  data: MapObjectData<string>;
}

