import type {MapObject, Specialist} from "@solaris/common";
import type {Star} from "@/types/game";

export type MapObjectWithShips = MapObject<string> & {
  name: string,
  ships: number | null,
  type: 'carrier' | 'star',
  specialist: Specialist | undefined | null,
}

export type StarWithTypes = Star & {
  isWormHole: boolean,
  wormHolePairStar: Star | null,
}
