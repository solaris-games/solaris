import type { DrawingContext } from "@/game/container";
import { useColourStore } from '@/stores/colour';
import type { GameStore } from '@/stores/game';

export class StoreDrawingContext implements DrawingContext {
  store: GameStore;
  private colourStore: ReturnType<typeof useColourStore>;

  constructor (store: GameStore) {
    this.store = store;
    this.colourStore = useColourStore();
  }

  getPlayerColour (playerId: string) {
    return this.colourStore.getColourForPlayer(this.store.game, playerId)!.value;
  }
}
