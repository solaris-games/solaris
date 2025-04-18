<template>

  <div>
    <div @click="toggleDisplay" class="pointer">
        <span class="me-1">
            <i class="fas fa-stopwatch"></i>
        </span>
      <span class="d-none d-md-inline-block me-1">
            Tick
        </span>
      <span class="d-none d-sm-inline-block user-select-none me-1">
            {{ tick }}
        </span>
      <span>
            <i class="fas" :class="{'fa-chevron-down':!display,'fa-chevron-up':display}"></i>
        </span>
    </div>

    <div class="tick-form container mt-1 p-3"
         :class="{'header-bar-bg': !isHistoricalMode,'bg-dark': isHistoricalMode}" v-if="display">
      <div class="row mt-0 pt-2 pb-2 g-0">
        <div class="col-12 mb-1">
          <input type="range" :min="minimumTick" :max="stateTick" class="slider" v-model="tick"
                 @change="onRequestedTickChanged" :disabled="isLoading">
        </div>
        <div class="col-5">
          <button class="btn btn-sm btn-secondary" @click="loadPreviousTick(turnTicks)"
                  :disabled="isLoading || tick <= minimumTick" :title="`Jump back ${turnTicks.value} ticks`">
            <i class="fas fa-angle-double-left"></i>
          </button>
          <button class="btn btn-sm btn-secondary ms-1" @click="loadPreviousTick(1)"
                  :disabled="isLoading || tick <= minimumTick" title="Previous tick">
            <i class="fas fa-angle-left"></i> Prev
          </button>
        </div>
        <div class="col-2 text-center">
          {{ tick }}
        </div>
        <div class="col-5 text-end">
          <button class="btn btn-sm btn-secondary" @click="loadNextTick(1)" :disabled="isLoading || tick >= stateTick"
                  title="Next tick">
            Next <i class="fas fa-angle-right"></i>
          </button>
          <button class="btn btn-sm btn-secondary ms-1" @click="loadNextTick(turnTicks)"
                  :disabled="isLoading || tick >= stateTick" :title="`Jump forward ${turnTicks.value} ticks`">
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {eventBusInjectionKey} from '../../../../eventBus'
import GameEventBusEventNames from '../../../../eventBusEventNames/game'
import GameApiService from '../../../../services/api/game'
import {inject, ref, onMounted, onUnmounted, computed} from 'vue'
import { useStore, type Store } from 'vuex';
import type {State} from "@/store";
import {useIsHistoricalMode} from "@/util/reactiveHooks";

const eventBus = inject(eventBusInjectionKey)!;

const store: Store<State> = useStore();

const isHistoricalMode = useIsHistoricalMode(store);

const isLoading = ref(false);
const display = ref(false);
const tick = ref(0);

const stateTick = computed(() => {
  return store.state.tick
});

const gameTick = computed(() => {
  return store.state.game.state.tick
});

const minimumTick = computed(() => {
  return store.state.game.state.timeMachineMinimumTick ?? 1;
});

const turnTicks = computed(() => {
  return (store.state.game.settings.gameTime.gameType === 'turnBased' ? store.state.game.settings.gameTime.turnJumps : 6);
});

const onGameTick = () => {
  if (tick.value === gameTick.value - 1) {
    tick.value = gameTick.value;
  }
};

const toggleDisplay = () => {
  display.value = !display.value;
};

const onRequestedTickChanged = async () => {
  if (isLoading.value || tick.value < 1 || tick.value > stateTick.value || tick.value === gameTick.value) {
    return
  }

  isLoading.value = true

  let game = store.state.game

  try {
    const response = await GameApiService.getGameGalaxy(game._id, tick.value);

    if (response.status === 200) {
      store.commit('setGame', response.data)
      tick.value = response.data.state.tick
    }
  } catch (err) {
    console.error(err)
  }

  isLoading.value = false
};

const loadPreviousTick = async (ticks: number) => {
  tick.value = Math.max(minimumTick.value, tick.value - ticks)
  await onRequestedTickChanged()
};

const loadNextTick = async (ticks: number) => {
  tick.value = Math.min(stateTick.value, tick.value + ticks)
  await onRequestedTickChanged()
};

onMounted(() => {
  tick.value = stateTick.value;
  eventBus.on(GameEventBusEventNames.OnGameTick, onGameTick);
});

onUnmounted(() => {
  eventBus.off(GameEventBusEventNames.OnGameTick, onGameTick);
});
</script>

<style scoped>
.pointer {
  cursor: pointer;
}

.user-select-none {
  user-select: none;
}

.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 15px;
  border-radius: 5px;
  background: #444;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #00bc8c;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #00bc8c;
  cursor: pointer;
}

.tick-form {
  z-index: 1;
  position: absolute;
  width: 300px;
  left: 0px;
}

@media screen and (max-width: 473px) {
  .tick-form {
    left: 0px;
  }
}
</style>
