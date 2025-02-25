import type { Location } from "@solaris-common";
import { EventEmitter } from "./eventEmitter";
import type { Container } from "pixi.js";

export abstract class MapObject extends EventEmitter {
  abstract getLocation(): Location;
  abstract getContainer(): Container;
  abstract onZoomChanging(zoomPercent: number): void;
}

