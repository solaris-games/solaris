import type { DrawingContext } from "@/game/container";
import type { Store } from 'vuex';
import type { State } from '@/store';
import { useColourStore } from '@/stores/colour';

export class StoreDrawingContext implements DrawingContext {
  store: Store<State>;
  private colourStore: ReturnType<typeof useColourStore>;

  constructor (store: Store<State>) {
    this.store = store;
    this.colourStore = useColourStore();
  }

  getPlayerColour (playerId: string) {
    return this.colourStore.getColourForPlayer(this.store.game, playerId)!.value;
  }
}
