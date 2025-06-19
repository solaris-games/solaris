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
import GameHelper from '../../../../services/gameHelper'
import type {Star} from "@/types/game";
import {httpInjectionKey} from "@/services/typedapi";
import type {State} from "@/store";
import { useStore, type Store } from 'vuex';
import {toastInjectionKey} from "@/util/keys";
import { ref, computed, inject } from 'vue';
import { upgradeEconomy as upgradeEconomyReq, upgradeIndustry as upgradeIndustryReq, upgradeScience as upgradeScienceReq } from "@/services/typedapi/star";
import {useIsHistoricalMode} from "@/util/reactiveHooks";
import {makeUpgrade} from "@/views/game/components/star/upgrade";

const props = defineProps<{
  star: Star,
  availableCredits: number,
  economy: number,
  industry: number,
  science: number,
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store: Store<State> = useStore();

const isUpgradingEconomy = ref(false);
const isUpgradingIndustry = ref(false);
const isUpgradingScience = ref(false);

const isGameFinished = computed(() => GameHelper.isGameFinished(store.state.game));
const isHistoricalMode = useIsHistoricalMode(store);

const upgrade = makeUpgrade(store, toast, props.star);

const upgradeEconomy = upgrade('economy', store.state.settings.star.confirmBuildEconomy, isUpgradingEconomy, 'gameStarEconomyUpgraded', upgradeEconomyReq(httpClient));
const upgradeIndustry = upgrade('industry', store.state.settings.star.confirmBuildIndustry, isUpgradingIndustry, 'gameStarIndustryUpgraded', upgradeIndustryReq(httpClient));
const upgradeScience = upgrade('science', store.state.settings.star.confirmBuildScience, isUpgradingScience, 'gameStarScienceUpgraded', upgradeScienceReq(httpClient));
</script>

<style scoped>
</style>
