<template>
<div class="row bg-dark pt-2 pb-2" v-if="selectedTechnology">
  <div class="col-12">
    <form-error-list v-bind:errors="errors"/>
  </div>

  <div class="col-12">
    <p class="mb-2">Share Technology. (Costs <span class="text-warning">${{tradeCost}}</span> per tech level)</p>

    <form class="row">
      <div class="col-7">
        <select class="form-control" id="technologySelection" v-model="selectedTechnology" :disabled="!availableTechnologies.length">
          <option v-for="opt in availableTechnologies" v-bind:key="opt.name + opt.level" v-bind:value="opt">
            {{ getTechnologyFriendlyName(opt.name) }} {{opt.level}} (${{opt.cost}})
          </option>
        </select>
      </div>
      <div class="col-5">
        <div class="d-grid gap-2">
          <modalButton modalName="shareTechnologyModal" classText="btn btn-success"
            :disabled="isHistoricalMode || isSendingTech || !availableTechnologies.length || selectedTechnology.cost > userPlayer.credits"><i class="fas fa-paper-plane"></i> Share</modalButton>
        </div>
      </div>
    </form>
  </div>

  <dialogModal modalName="shareTechnologyModal" titleText="Share Technology" cancelText="No" confirmText="Yes" @onConfirm="confirmSendTechnology">
    <p>Are you sure you want to share <b>{{selectedTechnology.name}}</b> (level {{selectedTechnology.level}}) with <b>{{player.alias}}</b>?</p>
  </dialogModal>
</div>
</template>

<script setup lang="ts">
import { inject, ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import ModalButton from '../../../components/modal/ModalButton.vue'
import DialogModal from '../../../components/modal/DialogModal.vue'
import TechnologyHelper from '../../../../services/technologyHelper'
import gameHelper from '../../../../services/gameHelper'
import FormErrorList from '../../../components/FormErrorList.vue'
import type {Game} from "@/types/game";
import {useIsHistoricalMode} from "@/util/reactiveHooks";
import {extractErrors, formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import type {ResearchType, TradeTechnology} from "@solaris-common";
import GameHelper from "../../../../services/gameHelper";
import {listTradeableTechnologies, sendTechnology} from "@/services/typedapi/trade";

const props = defineProps<{
  playerId: string,
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);
const isHistoricalMode = useIsHistoricalMode(store);

const errors = ref<string[]>([]);
const isSendingTech = ref(false);
const availableTechnologies = ref<TradeTechnology[]>([]);
const selectedTechnology = ref<TradeTechnology | null>(null);

const player = computed(() => GameHelper.getPlayerById(game.value, props.playerId)!);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value)!);
const tradeCost = computed(() => game.value.settings.player.tradeCost);

const getTechnologyFriendlyName = (key: ResearchType) => TechnologyHelper.getFriendlyName(key);

const getTradeableTechnologies = async () => {
  const response = await listTradeableTechnologies(httpClient)(game.value._id, player.value._id);
  if (isOk(response)) {
    availableTechnologies.value = response.data;

    if (availableTechnologies.value?.length) {
      selectedTechnology.value = availableTechnologies.value[0];
    }
  } else {
    console.error(formatError(response));
    errors.value = extractErrors(response);
  }
};

const confirmSendTechnology = async () => {
  errors.value = [];
  isSendingTech.value = true;

  if (!selectedTechnology.value) {
    return;
  }

  const response = await sendTechnology(httpClient)(game.value._id, player.value._id, selectedTechnology.value.name, selectedTechnology.value.level);
  if (isOk(response)) {
    toast.default(`Sent ${selectedTechnology.value.name} (level ${selectedTechnology.value.level}) to ${player.value.alias}.`);

    const playerTech = GameHelper.getPlayerById(game.value, player.value._id)!.research[selectedTechnology.value.name];

    playerTech.level = selectedTechnology.value.level;

    userPlayer.value.credits -= selectedTechnology.value.cost;

    player.value.reputation = response.data.reputation;

    await getTradeableTechnologies();
  } else {
    console.error(formatError(response));
    errors.value = extractErrors(response);
  }
};

onMounted(async () => {
  await getTradeableTechnologies();
});
</script>

<style scoped>
</style>
