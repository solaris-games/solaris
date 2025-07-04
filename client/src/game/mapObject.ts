import type { Location } from "@solaris-common";
import { EventEmitter } from "./eventEmitter";
import type { Container } from "pixi.js";

export interface MapObject {
  getLocation(): Location;
  getContainer(): Container;
  onZoomChanging(zoomPercent: number): void;
}

