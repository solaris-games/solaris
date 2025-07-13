<template>
  <div class="menu-page container">
    <menu-title title="Bulk Upgrade" @onCloseRequested="onCloseRequested"/>

    <p v-if="!types.length" class="pb-1 text-danger">Bulk upgrade has been disabled in this game. There are no
      infrastructure types that can be bulk upgraded.</p>

    <div v-if="types.length">
      <div class="row">
        <p class="col-12"><small>Select an amount of credits to spend and the kind of infrastructure you would like to
          buy. The cheapest infrastructure will be purchased throughout your empire.</small></p>
      </div>

      <form-error-list v-bind:errors="errors"/>

      <form @submit.prevent>
        <div class="row g-0">
          <div class="mb-2 input-group col">
            <span class="input-group-text">
              <i class="fas fa-calculator"></i>
            </span>
            <select class="form-select" id="strategyType" v-on:change="resetPreview" v-model="selectedUpgradeStrategy"
                    :disabled="isChecking || isUpgrading">
              <option value="totalCredits">Spend credits</option>
              <option value="percentageOfCredits">Spend percentage of credits</option>
              <option value="infrastructureAmount">Buy infrastructure amount</option>
              <option value="belowPrice">Buy below price</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="mb-2 input-group col">
            <span class="input-group-text">
              <i class="fas fa-dollar-sign" v-if="selectedUpgradeStrategy === 'totalCredits'"></i>
              <i class="fas fa-percent" v-if="selectedUpgradeStrategy === 'percentageOfCredits'"></i>
              <i class="fas fa-dollar-sign" v-if="selectedUpgradeStrategy === 'belowPrice'"></i>
              <i class="fas fa-industry" v-if="selectedUpgradeStrategy === 'infrastructureAmount'"></i>
            </span>
            <input v-on:input="resetHasChecked"
                   class="form-control"
                   id="amount"
                   v-model="amount"
                   type="number"
                   required
                   :disabled="isChecking || isUpgrading"
            />
          </div>
          <div class="mb-2 col">
            <select class="form-select" id="infrastructureType" v-on:change="resetPreview" v-model="selectedType"
                    :disabled="isChecking || isUpgrading">
              <option
                v-for="opt in types"
                v-bind:key="opt.key"
                v-bind:value="opt.key"
              >{{ opt.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="mb-2 input-group col">
            <span class="input-group-text">
              <i class="fas fa-hourglass"></i>
            </span>
            <select class="form-select" id="scheduleType" v-on:change="resetPreview" v-model="selectedScheduleStrategy"
                    :disabled="isChecking || isUpgrading">
              <option value="now">Now</option>
              <option value="future">Future</option>
              <option value="cycle-start">Start of cycle</option>
              <option value="cycle-end">End of cycle</option>
            </select>
          </div>
        </div>
        <div class="row" v-if="selectedScheduleStrategy === 'future' || selectedScheduleStrategy === 'cycle-end' || selectedScheduleStrategy === 'cycle-start'">
          <div class="mb-2 input-group col" v-if="selectedScheduleStrategy === 'future'">
            <span class="input-group-text">
              <i class="fas fa-clock"></i>
            </span>
            <input v-on:input="resetHasChecked"
                   class="form-control"
                   id="tick"
                   v-model="tick"
                   type="number"
                   required
                   :disabled="isChecking || isUpgrading"
            />
          </div>
          <div class="mb-2 input-group col">
            <span class="input-group-text">
              <i class="fas fa-sync"></i>
            </span>
            <select class="form-select" id="repeat" v-on:change="resetPreview" v-model="repeat"
                    :disabled="isChecking || isUpgrading">
              <option value="false">One time only</option>
              <option value="true">Repeat every cycle</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="mb-2 col">
            <div class="d-grid">
              <button class="btn btn-outline-info" v-on:click="check"
                      :disabled="isHistoricalMode || isUpgrading || isChecking || gameIsFinished()"><i
                class="fas fa-hammer me-1"></i>{{checkText}}
              </button>
            </div>
          </div>
        </div>
      </form>

      <loading-spinner :loading="isChecking"/>

      <div class="row bg-dark" v-if="hasChecked && !isChecking">
        <div class="col pt-3">
          <p><b class="text-success">{{ upgradeAvailable }}</b> upgrade<span v-if="upgradeAvailable > 1">s</span> for <b
            class="text-danger">${{ cost }}</b></p>
        </div>
        <div class="col-4 pt-2 ps-1">
          <div class="d-grid gap-2">
            <button class="btn btn-success" v-on:click="upgrade"
                    :disabled="isHistoricalMode || isUpgrading || isChecking || gameIsFinished()"><i
              class="fas fa-check me-1"></i>Confirm
            </button>
          </div>
        </div>
        <div class="col-12" v-if="ignoredCount">
          <p><small>{{ ignoredCount }} star(s) have been ignored by the bulk upgrade.</small></p>
        </div>
      </div>

      <div v-if="hasChecked && upgradePreview && upgradePreview.stars.length" class="row mt-2">
        <bulk-infrastructure-upgrade-report :upgrade-report="upgradePreview"></bulk-infrastructure-upgrade-report>
      </div>

      <div v-if="actionCount > 0">
        <h4 class="mt-2">Scheduled Buy Actions</h4>

        <bulk-infrastructure-upgrade-schedule-table @bulkScheduleTrashed="updateActionCount"/>
      </div>
      <h4 class="mt-2">Bulk Ignore Stars</h4>

      <bulk-infrastructure-upgrade-star-table @onOpenStarDetailRequested="onOpenStarDetailRequested" @bulkIgnoreChanged="resetPreview"
                  :highlightIgnoredInfrastructure="selectedType || undefined"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import MenuTitle from '../MenuTitle.vue'
import FormErrorList from '../../../components/FormErrorList.vue'
import GameHelper from '../../../../services/gameHelper'
import AudioService from '../../../../game/audio'
import { inject, ref, computed, onUnmounted, onMounted, type Ref } from 'vue';
import BulkInfrastructureUpgradeScheduleTable from './BulkInfrastructureUpgradeScheduleTable.vue'
import BulkInfrastructureUpgradeStarTable from './BulkInfrastructureUpgradeStarTable.vue'
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import BulkInfrastructureUpgradeReport from "@/views/game/components/star/BulkInfrastructureUpgradeReport.vue";
import {extractErrors, formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import type {BulkUpgradeReport, InfrastructureType, MapObject} from "@solaris-common";
import { useStore, type Store } from 'vuex';
import type { State } from "@/store";
import {scheduleBulk, upgradeBulk, upgradeBulkCheck} from "@/services/typedapi/star";
import {makeConfirm} from "@/util/confirm";
import {useIsHistoricalMode} from "@/util/reactiveHooks";

type ScheduleStrategy =  'future' | 'cycle-start' | 'cycle-end' | 'now';

const emit = defineEmits<{
  onCloseRequested: [],
  onOpenStarDetailRequested: [starId: string],
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;
const eventBus = inject(eventBusInjectionKey)!;

const store: Store<State> = useStore();
const confirm = makeConfirm(store);

const errors: Ref<string[]> = ref([]);
const isUpgrading = ref(false);
const isChecking = ref(false);
const hasChecked = ref(false);
const upgradePreview: Ref<BulkUpgradeReport<string> | null> = ref(null);
const amount = ref(0);
const previewAmount = ref(0);
const upgradeAvailable = ref(0);
const cost = ref(0);
const ignoredCount = ref(0);
const selectedType: Ref<InfrastructureType | null> = ref("economy");
const selectedUpgradeStrategy = ref("totalCredits");
const selectedScheduleStrategy: Ref<ScheduleStrategy> = ref('now');
const repeat = ref("false");
const tick: Ref<number> = ref(store.state.game.state.tick);
const types: Ref<{ key: InfrastructureType, name: string }[]> = ref([]);
const actionCount = ref(0);

const isHistoricalMode = useIsHistoricalMode(store);

const checkText = computed(() => {
  if (selectedScheduleStrategy.value === 'future' || selectedScheduleStrategy.value === 'cycle-end' || selectedScheduleStrategy.value === 'cycle-start') {
    return "Schedule"
  } else {
    return "Check"
  }
});

const setupInfrastructureTypes = () => {
  types.value = [];

  if (store.state.game.settings.player.developmentCost.economy !== 'none') {
    types.value.push({
      key: 'economy',
      name: 'Economy'
    })
  }

  if (store.state.game.settings.player.developmentCost.industry !== 'none') {
    types.value.push({
      key: 'industry',
      name: 'Industry'
    })
  }

  if (store.state.game.settings.player.developmentCost.science !== 'none') {
    types.value.push({
      key: 'science',
      name: 'Science'
    })
  }

  selectedType.value = types.value.length ? types.value[0].key : null;
};

const onCloseRequested = () => emit('onCloseRequested');

const onOpenStarDetailRequested = (e: string) => emit('onOpenStarDetailRequested', e);

const resetPreview = () => {
  hasChecked.value = false;
  upgradePreview.value = null;
};

const updateActionCount = () => actionCount.value = GameHelper.getUserPlayer(store.state.game)?.scheduledActions?.length || 0;

const getStar = (starId: string) => GameHelper.getStarById(store.state.game, starId)!;

const panToStar = (starId: string) => {
  const star: MapObject<string> = getStar(starId)!;
  eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: star });
};

const gameIsFinished = () => GameHelper.isGameFinished(store.state.game);

const resetHasChecked = () => !hasChecked.value;

const isFutureStrategy = (strategy: ScheduleStrategy) => strategy === 'future' || strategy === 'cycle-end' || strategy === 'cycle-start';

const check = async () => {
  errors.value = [];
  upgradePreview.value = null;

  if (!selectedType.value || amount.value <= 0 || (selectedUpgradeStrategy.value === 'percentageOfCredits' && amount.value > 100)) {
    return;
  }

  if (selectedScheduleStrategy.value === 'future' && tick.value < store.state.game.state.tick) {
    return;
  }

  isChecking.value = true;

  if (isFutureStrategy(selectedScheduleStrategy.value)) {
    if (selectedScheduleStrategy.value === 'cycle-end') {
      const cycleTicks = store.state.game.settings.galaxy.productionTicks;
      const currentTick = store.state.game.state.tick;
      const cycle = Math.floor(currentTick / cycleTicks) + 1;
      tick.value = cycle * cycleTicks - 1;
    } else if (selectedScheduleStrategy.value === 'cycle-start') {
      const cycleTicks = store.state.game.settings.galaxy.productionTicks;
      const currentTick = store.state.game.state.tick;
      const cycle = Math.floor(currentTick / cycleTicks) + 1;
      tick.value = cycle * cycleTicks;
    }

    const response = await scheduleBulk(httpClient)(store.state.game._id, {
      infrastructureType: selectedType.value!,
      buyType: selectedUpgradeStrategy.value,
      tick: tick.value,
      amount: amount.value,
      repeat: repeat.value === 'true',
    });

    if (isOk(response)) {
      AudioService.join();

      store.commit('gameBulkActionAdded', response.data);

      updateActionCount();

      toast.success(`Action scheduled. Action will be executed on tick ${response.data.tick}.`)
    } else {
      console.error(formatError(response));
      errors.value = extractErrors(response);
    }
  } else { // execute immediately
    upgradeAvailable.value = 0;
    cost.value = 0;

    const response = await upgradeBulkCheck(httpClient)(store.state.game._id, {
      infrastructure: selectedType.value!,
      upgradeStrategy: selectedUpgradeStrategy.value,
      amount: amount.value,
    });

    if (isOk(response)) {
      AudioService.join();

      upgradePreview.value = response.data;
      upgradeAvailable.value = response.data.upgraded;
      cost.value = response.data.cost;
      previewAmount.value = response.data.budget;
      ignoredCount.value = response.data.ignoredCount;
      hasChecked.value = true;
    } else {
      console.error(formatError(response));
      errors.value = extractErrors(response);
    }
  }

  isChecking.value = false;
};

const upgrade = async () => {
  errors.value = [];

  if (cost.value <= 0 || amount.value <= 0) {
    return;
  }

  if (!await confirm('Bulk upgrade', `Are you sure you want to spend $${cost.value} credits to upgrade ${selectedType.value} across all of your stars?`)) {
    return;
  }

  isUpgrading.value = true;

  const response = await upgradeBulk(httpClient)(store.state.game._id, {
    infrastructure: selectedType.value!,
    upgradeStrategy: selectedUpgradeStrategy.value,
    amount: amount.value,
  });

  if (isOk(response)) {
    AudioService.join();

    store.commit('gameStarBulkUpgraded', response.data);

    toast.success(`Upgrade complete. Purchased ${response.data.upgraded} ${selectedType.value} for ${response.data.cost} credits.`);

    if (selectedUpgradeStrategy.value === 'totalCredits') {
      const userPlayer = GameHelper.getUserPlayer(store.state.game)!;
      amount.value = userPlayer.credits;
    }
  } else {
    console.error(formatError(response));
    errors.value = extractErrors(response);
  }

  hasChecked.value = false;
  isUpgrading.value = false;
};

onMounted(() => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandShowIgnoreBulkUpgrade, {});

  const userPlayer = GameHelper.getUserPlayer(store.state.game)!;
  amount.value = userPlayer.credits;
  actionCount.value = userPlayer?.scheduledActions?.length || 0;

  setupInfrastructureTypes();
});

onUnmounted(() => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandHideIgnoreBulkUpgrade, {});
});
</script>

<style scoped>
</style>
