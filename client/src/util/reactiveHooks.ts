import { type Store } from 'vuex';
import type {State} from "@/store";
import { computed } from 'vue';

export const useIsHistoricalMode = (store: Store<State>) => {
  return computed(() => store.state.tick !== store.state.game.state.tick);
}
