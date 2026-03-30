
import { computed, customRef } from 'vue';
import {loadLocalPreference, storeLocalPreference} from "@/util/localPreference";

export const useIsHistoricalMode = (store: Store<State>) => {
  return computed(() => store.tick !== store.game.state.tick);
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
