<template>
  <div class="menu-page container">
    <menu-title title="Hire Specialist" @onCloseRequested="e => emit('onCloseRequested', e)">
      <button @click="_ => emit('onOpenStarDetailRequested', star._id)" class="btn btn-sm btn-outline-primary" title="Back to Star"><i
        class="fas fa-arrow-left"></i></button>
    </menu-title>

    <div class="row">
      <div class="col">
        <h4 class="mt-2">Star</h4>
      </div>
    </div>

    <div class="row mb-2 pt-1 pb-1 bg-dark" v-if="star">
      <div class="col">
        <a href="javascript:;" @click="_ => emit('onOpenStarDetailRequested', star._id)"><i class="fas fa-star"></i> {{ star.name }}</a>
      </div>
      <div class="col-auto">
        {{ star.ships }} <i class="fas fa-rocket ms-1"></i>
      </div>
    </div>

    <div v-if="specialists && specialists.length">
      <div v-for="specialist in specialists" :key="specialist.id" class="row mb-2 pt-1 pb-1 ">
        <div class="col mt-2">
          <h5 class="pt-1 text-warning">
            <specialist-icon :type="'star'" :defaultIcon="'star'" :specialist="specialist"/>
            <span class="ms-1">{{ specialist.name }}</span>
          </h5>
        </div>
        <div class="col-auto mt-2">
          <button class="btn btn-sm btn-success" v-if="!(star.specialist && star.specialist.id === specialist.id)"
                  :disabled="isHistoricalMode || isHiringSpecialist || cantAffordSpecialist(specialist) || isCurrentSpecialistOneShot"
                  @click="hireSpecialist(specialist)">
            <i class="fas fa-coins"></i>
            Hire for {{ getSpecialistActualCostString(specialist) }}
          </button>
          <span class="badge bg-primary" v-if="star.specialist && star.specialist.id === specialist.id">Active</span>
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
import {inject, ref, computed} from 'vue';
import {eventBusInjectionKey} from "@/eventBus";
import GameCommandEventBusEventNames from "@/eventBusEventNames/gameCommand";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import { useStore } from 'vuex';
import type {Game} from "@/types/game";
import type {Specialist} from "@solaris-common";
import {makeConfirm} from "@/util/confirm";
import {hireStar} from "@/services/typedapi/specialist";
import {toastInjectionKey} from "@/util/keys";
import {useIsHistoricalMode} from "@/util/reactiveHooks";

const props = defineProps<{
  starId: string,
}>();

const emit = defineEmits<{
  onCloseRequested: [e: Event],
  onOpenStarDetailRequested: [starId: string],
  onReloadGameRequested: [specialist: Specialist],
}>();

const httpClient = inject(httpInjectionKey)!;
const eventBus = inject(eventBusInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store = useStore();
const confirm = makeConfirm(store);
const game = computed<Game>(() => store.state.game);
const star = computed(() => game.value.galaxy.stars.find(s => s._id === props.starId)!);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value)!);
const isCurrentSpecialistOneShot = computed(() => Boolean(star.value.specialist?.oneShot));

const isHistoricalMode = useIsHistoricalMode(store);

const specialists = computed(() => store.state.starSpecialists.filter(s => game.value.settings.specialGalaxy.specialistBans.star.indexOf(s.id) < 0));

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

const shouldSpecialistRequireReload = (specialist: Specialist) => {
  const localKeys = [
    'scanning',
    'manufacturing',
  ];

  const specialKeys = [
    'economyInfrastructureMultiplier',
    'scienceInfrastructureMultiplier',
  ];

  if (specialist.modifiers && specialist.modifiers.local) {
    for (let key of localKeys) {
      if (specialist.modifiers.local[key] != null) {
        return true;
      }
    }
  }

  if (specialist.modifiers && specialist.modifiers.special) {
    for (let key of specialKeys) {
      if (specialist.modifiers.special[key] != null) {
        return true;
      }
    }
  }

  return false;
};

const hireSpecialist = async (specialist: Specialist) => {
  if (!await confirm('Hire specialist', `Are you sure you want to hire a ${specialist.name} for ${getSpecialistActualCostString(specialist)} on Star ${star.value.name}?`)) {
    return;
  }

  if (star.value.specialist && !await confirm('Replace specialist', `Are you sure you want to replace the existing specialist ${star.value.specialist.name} for a ${specialist.name}?`)) {
    return;
  }

  isHiringSpecialist.value = true;

  // If the specialist hired or existing specialist in any way affects scanning, manufacturing etc then reload the game map. Bit of a bodge but it works.
  const requiresFullReload = (star.value.specialist && shouldSpecialistRequireReload(star.value.specialist)) || shouldSpecialistRequireReload(specialist);

  const response = await hireStar(httpClient)(game.value._id, props.starId, specialist.id);

  if (isOk(response)) {
    if (requiresFullReload) {
      emit('onReloadGameRequested', specialist);
    } else {
      const currency = game.value.settings.specialGalaxy.specialistsCurrency;

      star.value.specialistId = specialist.id;
      star.value.specialistExpireTick = specialist.expireTicks ? game.value.state.tick + specialist.expireTicks : null;
      star.value.specialist = specialist;
      star.value.effectiveTechs = response.data.effectiveTechs;
      userPlayer.value[currency] -= getSpecialistActualCost(specialist);

      if (userPlayer.value.stats) {
        userPlayer.value.stats.totalStarSpecialists += 1;
        userPlayer.value.stats.totalSpecialists += 1;
      }

      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadStar, {star: star.value});
    }

    toast.default(`${specialist.name} has been hired for the star ${star.value.name}.`);
  } else {
    toast.error(`An error occurred while trying to hire the specialist: ${formatError(response)}`);
    console.error(formatError(response));
  }

  isHiringSpecialist.value = false;
};
</script>

<style scoped>
</style>
