<template>
  <div v-if="player">
    <div class="row" v-if="!player.defeated && options.length">
      <label class="col-5 col-form-label fw-bold">Queue</label>
      <div class="col-7 text-end">
        <button
          class="btn btn-success btn-sm"
          type="button"
          title="Add research to the end of the queue"
          v-if="queue.length < maxQueueLength"
          v-on:click="doAddQueueEntry"
          :disabled="isHistoricalMode || isGameFinished || loading"
        >
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </div>
    <div
      v-for="(entry, i) in player.defeated ? [] : queue"
      v-bind:key="`${i}-${entry}`"
      class="mb-2 row pt-1 pb-1 mb-0"
      :class="i % 2 === 0 ? 'bg-dark' : ''"
    >
      <div class="col-7 d-flex gap-1">
        <button
          class="btn btn-outline-primary btn-sm"
          type="button"
          title="Move up"
          v-on:click="doMoveQueueEntry(i, -1)"
          :disabled="i === 0 || isHistoricalMode || isGameFinished || loading"
        >
          <i class="fas fa-arrow-up"></i>
        </button>
        <button
          class="btn btn-outline-primary btn-sm"
          type="button"
          title="Move down"
          v-on:click="doMoveQueueEntry(i, 1)"
          :disabled="
            i === queue.length - 1 ||
            isHistoricalMode ||
            isGameFinished ||
            loading
          "
        >
          <i class="fas fa-arrow-down"></i>
        </button>
        <button
          class="btn btn-outline-danger btn-sm"
          type="button"
          title="Remove from queue"
          v-on:click="doRemoveQueueEntry(i)"
          :disabled="isHistoricalMode || isGameFinished || loading"
        >
          <i class="fas fa-times"></i>
        </button>
        <select
          class="form-select"
          v-model="queue[i]"
          v-on:change="doUpdateResearchQueue"
          :disabled="isHistoricalMode || isGameFinished || loading"
        >
          <option
            v-for="option in options"
            v-bind:value="option.value"
            v-bind:key="option.value"
          >
            {{ option.text }}
          </option>
        </select>
      </div>
      <div class="col-5 text-end">
        <label
          class="col-form-label"
          :title="`Queue position ${i + 1} ETA`"
          v-if="entryTicksEta[i] != null"
        >
          <timer :showETA="true" :ticks="entryTicksEta[i]" />
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "@/stores/game";
import GameHelper from "../../../../services/gameHelper";
import AudioService from "../../../../services/audio";
import { ref, computed, onMounted, inject, watch } from "vue";
import type { Game } from "@/types/game";
import {
  MAX_RESEARCH_QUEUE_LENGTH,
  type ResearchTypeNotRandom,
} from "@solaris/common";
import type { ResearchType } from "@solaris/common";
import { updateResearchQueue } from "@solaris/api-client/research";
import { formatError, isOk } from "@solaris/api-client";
import { httpInjectionKey } from "@/services/http";
import { useIsHistoricalMode } from "@/util/reactiveHooks";
import Timer from "@/views/game/components/time/Timer.vue";
import TechnologyHelper from "../../../../services/technologyHelper";

import { useToast } from "vue-toast-notification";
import { useGameServices } from "@/util/gameServices.ts";

const httpClient = inject(httpInjectionKey)!;
const toast = useToast();

const store = useGameStore();
const services = useGameServices();
const isHistoricalMode = useIsHistoricalMode(store);

const game = computed<Game>(() => store.game!);
const player = computed(() => GameHelper.getUserPlayer(game.value)!);
const isGameFinished = computed(() => GameHelper.isGameFinished(game.value));

const loading = ref(false);
const options = ref<{ text: string; value: ResearchType }[]>([]);
const queue = ref<ResearchType[]>([]);
const maxQueueLength = MAX_RESEARCH_QUEUE_LENGTH;

const loadOptions = () => {
  options.value = [
    ...TechnologyHelper.getResearchableOptions(
      game.value,
      services.technologyService,
    ),
    { text: "Random", value: "random" },
  ];

  if (player.value) {
    queue.value = player.value.researchQueue?.slice() ?? [];
  }
};

const simulateResearchPhase = (
  key: ResearchTypeNotRandom,
  virtualLevels: Record<ResearchTypeNotRandom, number>,
  virtualProgress: Record<ResearchTypeNotRandom, number>,
  totalScience: number,
): number => {
  const level = virtualLevels[key];
  const required = services.researchProgressService.getRequiredResearchProgress(
    game.value,
    key,
    level,
  );
  // At least one tick: the server only pops one queue entry per tick.
  const ticks = Math.max(
    Math.ceil((required - virtualProgress[key]) / totalScience),
    1,
  );

  let accrued = virtualProgress[key] + ticks * totalScience;
  let newLevel = level;
  let nextRequirement = required;
  while (accrued >= nextRequirement) {
    accrued -= nextRequirement;
    newLevel++;
    nextRequirement =
      services.researchProgressService.getRequiredResearchProgress(
        game.value,
        key,
        newLevel,
      );
  }

  virtualLevels[key] = newLevel;
  virtualProgress[key] = accrued;

  return ticks;
};

const entryTicksEta = computed<(number | null)[]>(() => {
  const p = player.value!;
  const totalScience = p.stats?.totalScience ?? 0;

  if (!totalScience) {
    return queue.value.map(() => null);
  }

  const virtualLevels = {} as Record<ResearchTypeNotRandom, number>; // fine since we set values next
  const virtualProgress = {} as Record<ResearchTypeNotRandom, number>;
  for (const key of Object.keys(p.research) as ResearchTypeNotRandom[]) {
    virtualLevels[key] = p.research[key].level;
    virtualProgress[key] = p.research[key].progress ?? 0;
  }

  let cumulativeTicks = simulateResearchPhase(
    p.researchingNow,
    virtualLevels,
    virtualProgress,
    totalScience,
  );

  return queue.value.map((entry) => {
    if (entry === "random") {
      return null; // tech is only chosen when the entry is popped
    }

    cumulativeTicks += simulateResearchPhase(
      entry,
      virtualLevels,
      virtualProgress,
      totalScience,
    );
    return cumulativeTicks;
  });
});

const doUpdateResearchQueue = async () => {
  loading.value = true;

  const response = await updateResearchQueue(httpClient)(game.value._id, [
    ...queue.value,
  ]);
  if (isOk(response)) {
    AudioService.join();
    player.value.researchQueue = queue.value;
    toast.default("Research queue updated.");
  } else {
    console.error(formatError(response));
    toast.error("Failed to update research queue.");
  }

  loading.value = false;
};

const doAddQueueEntry = () => {
  if (queue.value.length >= maxQueueLength) {
    return;
  }

  queue.value.push("random");
  doUpdateResearchQueue();
};

const doRemoveQueueEntry = (index: number) => {
  queue.value.splice(index, 1);
  doUpdateResearchQueue();
};

const doMoveQueueEntry = (index: number, delta: number) => {
  const targetIndex = index + delta;

  if (targetIndex < 0 || targetIndex >= queue.value.length) {
    return;
  }

  const entry = queue.value.splice(index, 1)[0];
  queue.value.splice(targetIndex, 0, entry);
  doUpdateResearchQueue();
};

watch(
  () => player.value?.researchQueue,
  (newQueue) => {
    if (loading.value) {
      return;
    }

    queue.value = newQueue?.slice() ?? [];
  },
  { deep: true },
);

onMounted(() => {
  loadOptions();
});
</script>
