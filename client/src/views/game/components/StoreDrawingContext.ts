import type { DrawingContext } from "@/game/container";
import type { Store } from 'vuex';
import type { State } from '@/store';

export class StoreDrawingContext implements DrawingContext {
  store: Store<State>;

  constructor (store: Store<State>) {
    this.store = store;
  }

  getPlayerColour (playerId: string) {
    return this.store.getters.getColourForPlayer(playerId).value;
  }
}
