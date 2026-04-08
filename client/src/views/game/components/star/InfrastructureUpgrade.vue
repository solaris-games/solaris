<template>
    <div class="row" v-if="economy != null || industry != null || science != null">
        <div class="col text-center pt-2 pb-2">
          <div class="d-grid gap-2">
            <button class="btn" v-if="economy != null"
              :class="{'btn-success': availableCredits >= economy, 'btn-secondary': availableCredits < economy}"
              :disabled="isHistoricalMode || isUpgradingEconomy || availableCredits < economy || isGameFinished"
              @click="upgradeEconomy"><small>Buy for ${{economy}}</small></button>
          </div>
        </div>
        <div class="col text-center bg-dark pt-2 pb-2">
          <div class="d-grid gap-2">
            <button class="btn" v-if="industry != null"
              :class="{'btn-success': availableCredits >= industry, 'btn-secondary': availableCredits < industry}"
              :disabled="isHistoricalMode || isUpgradingIndustry || availableCredits < industry || isGameFinished"
              @click="upgradeIndustry"><small>Buy for ${{industry}}</small></button>
          </div>
        </div>
        <div class="col text-center pt-2 pb-2">
          <div class="d-grid gap-2">
            <button class="btn" v-if="science != null"
              :class="{'btn-success': availableCredits >= science, 'btn-secondary': availableCredits < science}"
              :disabled="isHistoricalMode || isUpgradingScience || availableCredits < science || isGameFinished"
              @click="upgradeScience"><small>Buy for ${{science}}</small></button>
          </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import GameHelper from '../../../../services/gameHelper'
import type {Star} from "@/types/game";
import {httpInjectionKey} from "@/services/typedapi";

import {toastInjectionKey} from "@/util/keys";
import { ref, computed, inject } from 'vue';
import { upgradeEconomy as upgradeEconomyReq, upgradeIndustry as upgradeIndustryReq, upgradeScience as upgradeScienceReq } from "@/services/typedapi/star";
import {useIsHistoricalMode} from "@/util/reactiveHooks";
import {makeUpgrade} from "@/views/game/components/star/upgrade";
import {eventBusInjectionKey} from "@/eventBus";

const props = defineProps<{
  star: Star,
  availableCredits: number,
  economy: number | null,
  industry: number | null,
  science: number | null,
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

const upgrade = makeUpgrade(store, eventBus, toast, props.star);

const upgradeEconomy = upgrade('economy', store.settings!.star.confirmBuildEconomy === 'enabled', isUpgradingEconomy, (eb, data) => store.gameStarEconomyUpgraded(eb, data), upgradeEconomyReq(httpClient));
const upgradeIndustry = upgrade('industry', store.settings!.star.confirmBuildIndustry === 'enabled', isUpgradingIndustry, (eb, data) => store.gameStarIndustryUpgraded(eb, data), upgradeIndustryReq(httpClient));
const upgradeScience = upgrade('science', store.settings!.star.confirmBuildScience === 'enabled', isUpgradingScience, (eb, data) => store.gameStarScienceUpgraded(eb, data), upgradeScienceReq(httpClient));
</script>

<style scoped>
</style>
