<template>
  <form @submit.prevent v-if="player">
    <div class="mb-2 row mb-0 bg-info">
      <label class="col col-form-label">Total Science:</label>
      <div class="col text-end" v-if="player.stats">
        <label class="col-form-label">{{ player.stats.totalScience }} <i class="fas fa-flask"></i></label>
      </div>
    </div>
    <div class="mb-2 row pt-2 pb-2 mb-0 " v-if="!player.defeated && optionsNow.length">
      <label class="col-5 col-form-label">Researching:</label>
      <div class="col-7">
        <select class="form-control" v-model="player.researchingNow" v-on:change="doUpdateResearchNow" v-if="!loadingNow"
                :disabled="isHistoricalMode || isGameFinished">
          <option v-for="option in optionsNow" v-bind:value="option.value" v-bind:key="option.value">
            {{ option.text }}
          </option>
        </select>

        <label v-if="loadingNow" class="col-form-label">Loading...</label>
      </div>
    </div>
    <div class="mb-2 row mb-0 bg-dark" v-if="!player.defeated && optionsNow.length">
      <label class="col col-form-label" title="Current research ETA">ETA:</label>
      <div class="col text-end">
        <label class="col-form-label">{{ timeRemainingEta }}</label>
      </div>
    </div>
    <div class="mb-2 row pt-2 pb-2 mb-0  mt-1" v-if="!player.defeated && optionsNext.length > 1">
      <label class="col-5 col-form-label">Next:</label>
      <div class="col-7">
        <select class="form-control" v-model="player.researchingNext" v-on:change="doUpdateResearchNext"
                v-if="!loadingNext" :disabled="isHistoricalMode || isGameFinished">
          <option v-for="option in optionsNext" v-bind:value="option.value" v-bind:key="option.value">
            {{ option.text }}
          </option>
        </select>

        <label v-if="loadingNext" class="col-form-label">Loading...</label>
      </div>
    </div>
    <div class="mb-2 row mb-2 bg-dark" v-if="!player.defeated && optionsNext.length > 1 && timeNextRemainingEta">
      <label class="col col-form-label" title="Next research ETA">ETA:</label>
      <div class="col text-end">
        <label class="col-form-label">{{ timeNextRemainingEta }}</label>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import GameHelper from '../../../../services/gameHelper'
import TechnologyHelper from '../../../../services/technologyHelper'
import AudioService from '../../../../game/audio'
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import { useStore } from 'vuex';
import type {Game} from "@/types/game";
import {updateResearchNow, updateResearchNext} from "@/services/typedapi/resesarch";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import {useIsHistoricalMode} from "@/util/reactiveHooks";
import type {ResearchType} from "@solaris-common";

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store = useStore();
const isHistoricalMode = useIsHistoricalMode(store);
const game = computed<Game>(() => store.state.game);
const player = computed(() => GameHelper.getUserPlayer(game.value)!);
const isGameFinished = computed(() => GameHelper.isGameFinished(game.value));

type Option = { text: string, value: ResearchType };

const loadingNow = ref(false);
const loadingNext = ref(false);
const optionsNow = ref<Option[]>([]);
const optionsNext = ref<Option[]>([]);

const timeRemainingEta = ref<string | null>(null);
const timeNextRemainingEta = ref<string | null>(null);

const recalculateTimeRemaining = () => {
  timeRemainingEta.value = GameHelper.getCountdownTimeStringByTicksWithTickETA(game.value, player.value.currentResearchTicksEta || 0);

  if (player.value.nextResearchTicksEta == null) {
    timeNextRemainingEta.value = null;
  } else {
    timeNextRemainingEta.value = GameHelper.getCountdownTimeStringByTicksWithTickETA(game.value, player.value.nextResearchTicksEta);
  }
};

const loadTechnologies = () => {
  const options: Option[] = [
    {text: 'Scanning', value: 'scanning'},
    {text: 'Hyperspace Range', value: 'hyperspace'},
    {text: 'Terraforming', value: 'terraforming'},
    {text: 'Experimentation', value: 'experimentation'},
    {text: 'Weapons', value: 'weapons'},
    {text: 'Banking', value: 'banking'},
    {text: 'Manufacturing', value: 'manufacturing'},
    {text: 'Specialists', value: 'specialists'}
  ];

  optionsNow.value = options.filter(o => TechnologyHelper.isTechnologyEnabled(game.value, o.value)
    && TechnologyHelper.isTechnologyResearchable(game.value, o.value));
  optionsNext.value = options.filter(o => TechnologyHelper.isTechnologyEnabled(game.value, o.value)
    && TechnologyHelper.isTechnologyResearchable(game.value, o.value));

  optionsNext.value.push({text: 'Random', value: 'random'});
};

const doUpdateResearchNow = async () => {
  loadingNow.value = true;

  const response = await updateResearchNow(httpClient)(game.value._id, player.value.researchingNow);
  if (isOk(response)) {
    AudioService.join();
    player.value.currentResearchTicksEta = response.data.ticksEta;
    player.value.nextResearchTicksEta = response.data.ticksNextEta;
    recalculateTimeRemaining();
    toast.default("Current research updated.");
  } else {
    console.error(formatError(response));
    toast.error("Failed to update research.")
  }

  loadingNow.value = false;
};

const doUpdateResearchNext = async () => {
  loadingNext.value = true;

  const response = await updateResearchNext(httpClient)(game.value._id, player.value.researchingNow);
  if (isOk(response)) {
    AudioService.join();
    player.value.currentResearchTicksEta = response.data.ticksEta;
    player.value.nextResearchTicksEta = response.data.ticksNextEta;
    recalculateTimeRemaining();
    toast.default("Current research updated.");
  } else {
    console.error(formatError(response));
    toast.error("Failed to update research.")
  }

  loadingNext.value = false;
};

onMounted(() => {
  loadTechnologies();

  recalculateTimeRemaining();

  let intervalFunction = 0;

  if (GameHelper.isGameInProgress(game.value) || GameHelper.isGamePendingStart(game.value)) {
    intervalFunction = setInterval(recalculateTimeRemaining, 1000);
  }

  onUnmounted(() => {
    intervalFunction && clearInterval(intervalFunction);
  })
});
</script>

<style scoped>
</style>
