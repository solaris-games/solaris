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
import { useGameStore } from '@/stores/game';
import GameHelper from '../../../../services/gameHelper'
import type {Star} from "@/types/game";
import {httpInjectionKey} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";

import {useIsHistoricalMode} from "@/util/reactiveHooks";
import {makeUpgrade, makeWarpgateActions} from "@/views/game/components/star/upgrade";
import {
  upgradeEconomy as upgradeEconomyReq,
  upgradeIndustry as upgradeIndustryReq,
  upgradeScience as upgradeScienceReq
} from "@/services/typedapi/star";
import { ref, computed, inject } from 'vue';
import {eventBusInjectionKey} from "@/eventBus";

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

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store = useGameStore();

const isUpgradingEconomy = ref(false);
const isUpgradingIndustry = ref(false);
const isUpgradingScience = ref(false);

const isGameFinished = computed(() => GameHelper.isGameFinished(store.game!));
const isHistoricalMode = useIsHistoricalMode(store);
const userPlayer = computed(() => GameHelper.getUserPlayer(store.game!));
const canBuildWarpGates = computed(() => store.game!.settings.specialGalaxy.warpgateCost !== 'none');
const canDestroyWarpGates = computed(() => store.game!.state.startDate != null);

const onBuildCarrierRequested = () => emit('onBuildCarrierRequested', props.star._id);

const upgrade = makeUpgrade(store, eventBus, toast, props.star);

const upgradeEconomy = upgrade('economy', store.settings!.star.confirmBuildEconomy === 'enabled', isUpgradingEconomy, (eb, data) => store.gameStarEconomyUpgraded(eb, data), upgradeEconomyReq(httpClient));
const upgradeIndustry = upgrade('industry', store.settings!.star.confirmBuildIndustry === 'enabled', isUpgradingIndustry, (eb, data) => store.gameStarIndustryUpgraded(eb, data), upgradeIndustryReq(httpClient));
const upgradeScience = upgrade('science', store.settings!.star.confirmBuildScience === 'enabled', isUpgradingScience, (eb, data) => store.gameStarScienceUpgraded(eb, data), upgradeScienceReq(httpClient));

const { buildWarpGate, destroyWarpGate } = makeWarpgateActions(store, eventBus, toast, httpClient, props.star);
</script>

<style scoped>
</style>
