import type {MapObject, Location} from "@solaris-common";

export type RulerPoint = {
  type: 'star' | 'carrier',
  object: MapObject<string>,
  location: Location,
  distance: number,
};
