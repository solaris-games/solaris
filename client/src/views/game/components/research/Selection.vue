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
    <research-queue />
  </form>
</template>

<script setup lang="ts">
import { useGameStore } from "@/stores/game";
import GameHelper from "../../../../services/gameHelper";
import AudioService from "../../../../services/audio";
import { ref, computed, onMounted, inject } from "vue";
import type { Game } from "@/types/game";
import { updateResearchNow } from "@solaris/api-client/research";
import { formatError, isOk } from "@solaris/api-client";
import { httpInjectionKey } from "@/services/http";
import { useIsHistoricalMode } from "@/util/reactiveHooks";
import type { ResearchTypeNotRandom } from "@solaris/common";
import Timer from "@/views/game/components/time/Timer.vue";
import TechnologyHelper from "../../../../services/technologyHelper";
import ResearchQueue from "./ResearchQueue.vue";

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

const loadingNow = ref(false);
const optionsNow = ref<{ text: string; value: ResearchTypeNotRandom }[]>([]);

const loadTechnologies = () => {
  optionsNow.value = TechnologyHelper.getResearchableOptions(
    game.value,
    services.technologyService,
  );
};

const currentResearchTicksEta = computed<number | null>(() => {
  const target = player.value!;
  const totalScience = target.stats?.totalScience ?? 0;

  if (!totalScience) {
    return null;
  }

  const tech = target.research[target.researchingNow];
  const requiredProgress =
    services.researchProgressService.getRequiredResearchProgress(
      game.value,
      target.researchingNow,
      tech.level,
    );
  const remainingPoints = requiredProgress - tech.progress!;

  return Math.ceil(remainingPoints / totalScience);
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

onMounted(() => {
  loadTechnologies();
});
</script>

<style scoped></style>
