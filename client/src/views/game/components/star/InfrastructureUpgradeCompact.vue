<template>
  <div class="row bg-dark pt-2 pb-2" v-if="userPlayer">
    <div class="col pe-0">
      <button class="btn btn-sm me-1" v-if="economy != null"
              :class="{'btn-success': availableCredits >= economy, 'btn-primary': availableCredits < economy}"
              :disabled="isHistoricalMode || isUpgradingEconomy || availableCredits < economy || isGameFinished"
              @click="upgradeEconomy"
              title="Upgrade economic infrastructure">
        <i class="fas fa-money-bill-wave me-1"></i>${{economy}}
      </button>
      <button class="btn btn-sm me-1" v-if="industry != null"
              :class="{'btn-success': availableCredits >= industry, 'btn-primary': availableCredits < industry}"
              :disabled="isHistoricalMode || isUpgradingIndustry || availableCredits < industry || isGameFinished"
              @click="upgradeIndustry"
              title="Upgrade industrial infrastructure">
        <i class="fas fa-tools me-1"></i>${{industry}}
      </button>
      <button class="btn btn-sm" v-if="science != null"
              :class="{'btn-success': availableCredits >= science, 'btn-primary': availableCredits < science}"
              :disabled="isHistoricalMode || isUpgradingScience || availableCredits < science || isGameFinished"
              @click="upgradeScience"
              title="Upgrade scientific infrastructure">
        <i class="fas fa-flask me-1"></i>${{science}}
      </button>
    </div>
    <div class="col-auto ps-0" v-if="userPlayer">
      <button v-if="canBuildWarpGates && !star.warpGate" :disabled="isHistoricalMode || userPlayer.credits < (star.upgradeCosts?.warpGate || 0) || isGameFinished" class="btn btn-sm btn-primary me-1" title="Build a warp gate - Grants x3 speed between warp gates" @click="buildWarpGate">
        <i class="fas fa-dungeon me-1"></i>${{star.upgradeCosts!.warpGate}}
      </button>
      <button v-if="canDestroyWarpGates && star.warpGate" :disabled="isHistoricalMode || isGameFinished" class="btn btn-sm btn-outline-danger me-1" @click="destroyWarpGate" title="Destroy the warp gate">
        <i class="fas fa-dungeon"></i> <i class="fas fa-trash ms-1"></i>
      </button>
      <button :disabled="isHistoricalMode || userPlayer.credits < (star.upgradeCosts?.carriers || 0) || star.ships! < 1 || isGameFinished" class="btn btn-sm btn-info" @click="onBuildCarrierRequested">
        <i class="fas fa-rocket me-1"></i>${{star.upgradeCosts!.carriers}}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import starService from '../../../../services/api/star'
import AudioService from '../../../../game/audio'
import GameHelper from '../../../../services/gameHelper'
import type {Star} from "@/types/game";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import type {State} from "@/store";
import {useIsHistoricalMode} from "@/util/reactiveHooks";
import {makeUpgrade} from "@/views/game/components/star/upgrade";
import {
  upgradeEconomy as upgradeEconomyReq,
  upgradeIndustry as upgradeIndustryReq,
  upgradeScience as upgradeScienceReq
} from "@/services/typedapi/star";
import { ref, computed, inject } from 'vue';
import { useStore, type Store } from 'vuex';
import {makeConfirm} from "@/util/confirm";
import { buildWarpGate as buildWarpGateReq, destroyWarpGate as destroyWarpGateReq } from "@/services/typedapi/star";

const props = defineProps<{
  star: Star,
  availableCredits: number,
  economy: number | null,
  industry: number | null,
  science: number | null,
}>();

const emit = defineEmits<{
  onBuildCarrierRequested: [starId: string],
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store: Store<State> = useStore();
const confirm = makeConfirm(store);

const isUpgradingEconomy = ref(false);
const isUpgradingIndustry = ref(false);
const isUpgradingScience = ref(false);

const isGameFinished = computed(() => GameHelper.isGameFinished(store.state.game));
const isHistoricalMode = useIsHistoricalMode(store);
const userPlayer = computed(() => GameHelper.getUserPlayer(store.state.game));
const canBuildWarpGates = computed(() => store.state.game.settings.specialGalaxy.warpgateCost !== 'none');
const canDestroyWarpGates = computed(() => store.state.game.state.startDate != null);

const onBuildCarrierRequested = () => emit('onBuildCarrierRequested', props.star._id);

const upgrade = makeUpgrade(store, toast, props.star);

const upgradeEconomy = upgrade('economy', store.state.settings.star.confirmBuildEconomy === 'enabled', isUpgradingEconomy, 'gameStarEconomyUpgraded', upgradeEconomyReq(httpClient));
const upgradeIndustry = upgrade('industry', store.state.settings.star.confirmBuildIndustry === 'enabled', isUpgradingIndustry, 'gameStarIndustryUpgraded', upgradeIndustryReq(httpClient));
const upgradeScience = upgrade('science', store.state.settings.star.confirmBuildScience === 'enabled', isUpgradingScience, 'gameStarScienceUpgraded', upgradeScienceReq(httpClient));

const buildWarpGate = async () => {
  if (store.state.settings.star.confirmBuildWarpGate === 'enabled' && !await confirm('Build Warp Gate', `Are you sure you want build a Warp Gate at ${props.star.name}? The upgrade will cost $${props.star.upgradeCosts!.warpGate}.`)) {
    return;
  }

  const response = await buildWarpGateReq(httpClient)(store.state.game._id, props.star._id);

  if (isOk(response)) {
    toast.default(`Warp Gate built at ${props.star.name}.`)

    store.commit('gameStarWarpGateBuilt', response.data);

    AudioService.join();
  } else {
    console.error(formatError(response));
    toast.error("Error building warp gate");
  }
};

const destroyWarpGate = async () => {
  if (store.state.settings.star.confirmDestroyWarpGate === 'enabled' && !await confirm('Destroy Warp Gate', `Are you sure you want destroy a Warp Gate at ${props.star.name}? The upgrade will cost $${props.star.upgradeCosts!.warpGate}.`)) {
    return;
  }

  const response = await destroyWarpGateReq(httpClient)(store.state.game._id, props.star._id);

  if (isOk(response)) {
    toast.default(`Warp Gate destroyed at ${props.star.name}.`)

    store.commit('gameStarWarpGateDestroyed', {
      starId: props.star._id
    });

    AudioService.join();
  } else {
    console.error(formatError(response));
    toast.error("Error destroying warp gate");
  }
};
</script>

<style scoped>
</style>
