<template>
  <form @submit.prevent v-if="player">
    <div class="mb-2 row mb-0 bg-info">
      <label class="col col-form-label">Total Science:</label>
      <div class="col text-end" v-if="player.stats">
        <label class="col-form-label"
          >{{ player.stats.totalScience }} <i class="fas fa-flask"></i
        ></label>
      </div>
    </div>
    <div
      class="mb-2 row pt-2 pb-2 mb-0"
      v-if="!player.defeated && optionsNow.length"
    >
      <label class="col-5 col-form-label">Researching:</label>
      <div class="col-7">
        <select
          class="form-select"
          v-model="player.researchingNow"
          v-on:change="doUpdateResearchNow"
          v-if="!loadingNow"
          :disabled="isHistoricalMode || isGameFinished"
        >
          <option
            v-for="option in optionsNow"
            v-bind:value="option.value"
            v-bind:key="option.value"
          >
            {{ option.text }}
          </option>
        </select>

        <label v-if="loadingNow" class="col-form-label">Loading...</label>
      </div>
    </div>
    <div
      class="mb-2 row mb-0 bg-dark"
      v-if="!player.defeated && optionsNow.length"
    >
      <label class="col col-form-label" title="Current research ETA"
        >ETA:</label
      >
      <div class="col text-end">
        <label class="col-form-label">
          <timer :showETA="true" :ticks="currentResearchTicksEta || 0" />
        </label>
      </div>
    </div>
    <div
      class="mb-2 row pt-2 pb-2 mb-0 mt-1"
      v-if="!player.defeated && optionsQueue.length"
    >
      <label class="col-5 col-form-label">Queue:</label>
      <div class="col-7 text-end">
        <button
          class="btn btn-outline-primary btn-sm"
          type="button"
          title="Add research to the end of the queue"
          v-if="queue.length < maxQueueLength"
          v-on:click="doAddQueueEntry"
          :disabled="isHistoricalMode || isGameFinished || loadingQueue"
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
          class="btn btn-outline-secondary btn-sm"
          type="button"
          title="Move up"
          v-on:click="doMoveQueueEntry(i, -1)"
          :disabled="
            i === 0 || isHistoricalMode || isGameFinished || loadingQueue
          "
        >
          <i class="fas fa-arrow-up"></i>
        </button>
        <button
          class="btn btn-outline-secondary btn-sm"
          type="button"
          title="Move down"
          v-on:click="doMoveQueueEntry(i, 1)"
          :disabled="
            i === queue.length - 1 ||
            isHistoricalMode ||
            isGameFinished ||
            loadingQueue
          "
        >
          <i class="fas fa-arrow-down"></i>
        </button>
        <button
          class="btn btn-outline-secondary btn-sm"
          type="button"
          title="Remove from queue"
          v-on:click="doRemoveQueueEntry(i)"
          :disabled="isHistoricalMode || isGameFinished || loadingQueue"
        >
          <i class="fas fa-times"></i>
        </button>
        <select
          class="form-select"
          v-model="queue[i]"
          v-on:change="doUpdateResearchQueue"
          :disabled="isHistoricalMode || isGameFinished || loadingQueue"
        >
          <option
            v-for="option in optionsQueue"
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
  </form>
</template>

<script setup lang="ts">
import { useGameStore } from "@/stores/game";
import GameHelper from "../../../../services/gameHelper";
import AudioService from "../../../../services/audio";
import { ref, computed, onMounted, inject } from "vue";
import type { Game } from "@/types/game";
import { MAX_RESEARCH_QUEUE_LENGTH } from "@solaris/common";
import {
  updateResearchNow,
  updateResearchQueue,
} from "@/services/typedapi/research";
import { formatError, httpInjectionKey, isOk } from "@/services/typedapi";
import { useIsHistoricalMode } from "@/util/reactiveHooks";
import type { ResearchType, ResearchTypeNotRandom } from "@solaris/common";
import Timer from "@/views/game/components/time/Timer.vue";

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

type Option = { text: string; value: ResearchType };

const loadingNow = ref(false);
const loadingQueue = ref(false);
const optionsNow = ref<Option[]>([]);
const optionsQueue = ref<Option[]>([]);
const queue = ref<ResearchType[]>([]);
const maxQueueLength = MAX_RESEARCH_QUEUE_LENGTH;

const loadTechnologies = () => {
  const options: Option[] = [
    { text: "Scanning", value: "scanning" },
    { text: "Hyperspace Range", value: "hyperspace" },
    { text: "Terraforming", value: "terraforming" },
    { text: "Experimentation", value: "experimentation" },
    { text: "Weapons", value: "weapons" },
    { text: "Banking", value: "banking" },
    { text: "Manufacturing", value: "manufacturing" },
    { text: "Specialists", value: "specialists" },
  ];

  optionsNow.value = options.filter(
    (o) =>
      o.value !== "random" &&
      services.technologyService.isTechnologyEnabled(game.value, o.value) &&
      services.technologyService.isTechnologyResearchable(game.value, o.value),
  );
  optionsQueue.value = [
    ...optionsNow.value,
    { text: "Random", value: "random" as ResearchType },
  ];

  if (player.value) {
    queue.value = player.value.researchQueue?.slice() || [];
  }
};

const researchEtaForTech = (target: ResearchTypeNotRandom): number | null => {
  const totalScience = player.value.stats?.totalScience ?? 0;

  if (!totalScience) {
    return null;
  }

  const tech = player.value.research[target];
  const requiredProgress =
    services.researchProgressService.getRequiredResearchProgress(
      game.value,
      target,
      tech.level,
    );
  const remainingPoints = requiredProgress - tech.progress!;

  return Math.ceil(remainingPoints / totalScience);
};

const currentResearchTicksEta = computed<number | null>(() =>
  researchEtaForTech(player.value!.researchingNow),
);

const entryTicksEta = computed<(number | null)[]>(() => {
  const target = player.value!;
  const totalScience = target.stats?.totalScience ?? 0;

  if (!totalScience) {
    return queue.value.map(() => null);
  }

  const virtualLevels: Record<string, number> = {};
  for (const key of Object.keys(target.research)) {
    virtualLevels[key] = target.research[key].level;
  }

  let cumulativePoints = currentResearchTicksEta.value
    ? (currentResearchTicksEta.value as number) * totalScience
    : 0;

  if (currentResearchTicksEta.value != null) {
    virtualLevels[target.researchingNow]++;
  }

  return queue.value.map((entry) => {
    if (entry === "random") {
      return null;
    }

    cumulativePoints +=
      services.researchProgressService.getRequiredResearchProgress(
        game.value,
        entry,
        virtualLevels[entry],
      );
    virtualLevels[entry]++;

    return Math.ceil(cumulativePoints / totalScience);
  });
});

const doUpdateResearchNow = async () => {
  loadingNow.value = true;

  const response = await updateResearchNow(httpClient)(
    game.value._id,
    player.value.researchingNow,
  );
  if (isOk(response)) {
    AudioService.join();
    toast.default("Current research updated.");
  } else {
    console.error(formatError(response));
    toast.error("Failed to update research.");
  }

  loadingNow.value = false;
};

const doUpdateResearchQueue = async () => {
  loadingQueue.value = true;

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

  loadingQueue.value = false;
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

onMounted(() => {
  loadTechnologies();
});
</script>

<style scoped></style>
