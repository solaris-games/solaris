<template>
  <div class="menu-page container">
    <menu-title title="Hire Specialist" @onCloseRequested="e => emit('onCloseRequested', e)">
      <button @click="_ => emit('onOpenCarrierDetailRequested', carrier._id)" class="btn btn-sm btn-outline-primary"
              title="Back to Carrier"><i class="fas fa-arrow-left"></i></button>
    </menu-title>

    <div class="row">
      <div class="col">
        <h4 class="mt-2">Carrier</h4>
      </div>
    </div>

    <div class="row mb-2 pt-1 pb-1 bg-dark" v-if="carrier">
      <div class="col">
        <a href="javascript:;" @click="_ => emit('onOpenCarrierDetailRequested', carrier._id)"><i class="fas fa-rocket"></i>
          {{ carrier.name }}</a>
      </div>
      <div class="col-auto">
        <i class="fas fa-map-marker-alt"></i>
        <i class="fas fa-sync ms-1" v-if="carrier.waypointsLooped"></i> {{ carrier.waypoints.length }}
      </div>
      <div class="col-auto">
        {{ carrier.ships }} <i class="fas fa-rocket ms-1"></i>
      </div>
    </div>

    <div v-if="specialists && specialists.length">
      <div v-for="specialist in specialists" :key="specialist.id" class="row mb-2 pt-1 pb-1 ">
        <div class="col mt-2">
          <h5 class="pt-1 text-warning">
            <specialist-icon :type="'carrier'" :defaultIcon="'rocket'" :specialist="specialist"/>
            <span class="ms-1">{{ specialist.name }}</span>
          </h5>
        </div>
        <div class="col-auto mt-2">
          <button class="btn btn-sm btn-success"
                  v-if="!(carrier.specialist && carrier.specialist.id === specialist.id)"
                  :disabled="isHistoricalMode || isHiringSpecialist || cantAffordSpecialist(specialist) || isCurrentSpecialistOneShot"
                  @click="hireSpecialist(specialist)">
            <i class="fas fa-coins"></i>
            Hire for {{ getSpecialistActualCostString(specialist) }}
          </button>
          <span class="badge bg-primary"
                v-if="carrier.specialist && carrier.specialist.id === specialist.id">Active</span>
        </div>
        <div class="col-12 mt-2">
          <p>{{ specialist.description }}</p>
          <p v-if="specialist.oneShot" class="text-warning"><small>This specialist cannot be replaced.</small></p>
          <p v-if="specialist.expireTicks" class="text-warning"><small>This specialist expires after
            {{ specialist.expireTicks }} ticks.</small></p>
        </div>
      </div>
    </div>

    <p v-if="specialists && !specialists.length" class="text-center pb-2">No specialists available to hire.</p>
  </div>
</template>

<script setup lang="ts">
import MenuTitle from '../MenuTitle.vue'
import GameHelper from '../../../../services/gameHelper'
import SpecialistIcon from '../specialist/SpecialistIcon.vue'
import {computed, ref, inject} from 'vue';
import {eventBusInjectionKey} from "@/eventBus";
import GameCommandEventBusEventNames from "@/eventBusEventNames/gameCommand";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import {useStore} from "vuex";
import type {Game} from "@/types/game";
import {useIsHistoricalMode} from "@/util/reactiveHooks";
import type {Specialist} from "@solaris-common";
import {makeConfirm} from "@/util/confirm";
import {hireCarrier} from "@/services/typedapi/specialist";
import {useGameServices} from "@/util/gameServices";

const props = defineProps<{
  carrierId: string,
}>();

const emit = defineEmits<{
  onCloseRequested: [e: Event],
  onOpenCarrierDetailRequested: [carrierId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store = useStore();
const confirm = makeConfirm(store);

const game = computed<Game>(() => store.state.game);
const carrier = computed(() => GameHelper.getCarrierById(game.value, props.carrierId)!);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value)!);
const specialists = computed(() => store.state.carrierSpecialists.filter(s => game.value.settings.specialGalaxy.specialistBans.carrier.indexOf(s.id) < 0));
const isCurrentSpecialistOneShot = computed(() => Boolean(carrier.value.specialist?.oneShot));

const gameServices = useGameServices();

const isHistoricalMode = useIsHistoricalMode(store);

const isHiringSpecialist = ref(false);

const getSpecialistActualCost = (specialist: Specialist): number => {
  const expenseConfig = game.value.constants.star.specialistsExpenseMultipliers[game.value.settings.specialGalaxy.specialistCost];

  if (game.value.settings.specialGalaxy.specialistsCurrency === 'credits') {
    return specialist.baseCostCredits * expenseConfig;
  } else if (game.value.settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists') {
    return specialist.baseCostCreditsSpecialists * expenseConfig;
  } else {
    throw new Error('Unknown specialists currency type');
  }
};

const getSpecialistActualCostString = (specialist: Specialist) => {
  const actualCost = getSpecialistActualCost(specialist);

  if (game.value.settings.specialGalaxy.specialistsCurrency === 'credits') {
    return `$${actualCost}`
  } else if (game.value.settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists') {
    return `${actualCost} token${actualCost > 1 ? 's' : ''}`
  } else {
    throw new Error('Unknown specialists currency type');
  }
};

const cantAffordSpecialist = (specialist: Specialist) => {
  return userPlayer.value[game.value.settings.specialGalaxy.specialistsCurrency] < getSpecialistActualCost(specialist);
};

const hireSpecialist = async (specialist: Specialist) => {
  if (!await confirm('Hire specialist', `Are you sure you want to hire a ${specialist.name} for ${getSpecialistActualCostString(specialist)} on Carrier ${carrier.value.name}?`)) {
    return;
  }

  if (carrier.value.specialist && !await confirm('Replace specialist', `Are you sure you want to replace the existing specialist ${carrier.value.specialist.name} for a ${specialist.name}?`)) {
    return;
  }

  isHiringSpecialist.value = true;

  const response = await hireCarrier(httpClient)(game.value._id, carrier.value._id, specialist.id);

  if (isOk(response)) {
    toast.default(`${specialist.name} has been hired for the carrier ${carrier.value.name}.`)

    const currency = game.value.settings.specialGalaxy.specialistsCurrency;

    carrier.value.specialistId = specialist.id;
    carrier.value.specialistExpireTick = specialist.expireTicks ? game.value.state.tick + specialist.expireTicks : null;
    carrier.value.specialist = specialist;
    carrier.value.effectiveTechs = response.data.effectiveTechs;

    const cost = getSpecialistActualCost(specialist);
    if (currency === "credits") {
      userPlayer.value.credits -= cost;
    } else if (currency === "creditsSpecialists") {
      userPlayer.value.creditsSpecialists -= cost;
    }

    if (response.data.waypoints) {
      carrier.value.waypoints = response.data.waypoints.waypoints;
      carrier.value.waypointsLooped = response.data.waypoints.waypointsLooped;

      gameServices.waypointService.populateCarrierWaypointEta(game.value, carrier.value);
    }

    if (userPlayer.value.stats) {
      userPlayer.value.stats.totalCarrierSpecialists++
      userPlayer.value.stats.totalSpecialists++
    }

    eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, { carrier: carrier.value });
  } else {
    toast.error(`An error occurred while trying to hire the specialist: ${formatError(response)}`);
    console.error(formatError(response));
  }


  isHiringSpecialist.value = false;
}
</script>

<style scoped>
</style>
