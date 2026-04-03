
import { computed, customRef } from 'vue';
import {loadLocalPreference, storeLocalPreference} from "@/util/localPreference";
import type { GameStore } from '@/stores/game';

export const useIsHistoricalMode = (store: GameStore) => {
  return computed(() => store.tick !== store.game!.state.tick);
}

export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  return customRef((track, trigger) => {
    return {
      get: () => {
        track();
        return loadLocalPreference(key, defaultValue);
      },
      set: (value: T) => {
        trigger();
        storeLocalPreference(key, value);
      },
    }
  });
}
