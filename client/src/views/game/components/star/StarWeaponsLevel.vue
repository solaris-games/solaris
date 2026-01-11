<template>
  <details v-if="star.ownedByPlayerId && compact">
    <summary class="row pb-2">
      <span class="col-auto">
        <span class="weapons-header"></span>
        <i class="fas fa-gun ms-1"></i>
        {{ weaponsDetail.total }}
      </span>
    </summary>

    <div class="row pb-2">
      <div class="col-auto" title="Weapons technology">
        Weapons technology
        {{ weaponsDetail.weaponsLevel }}
        <i class="fas fa-gun ms-1"></i>
      </div>
    </div>

    <div class="row pb-2">
      <div class="col-auto" title="Defender Bonus">
        Defender Bonus
        {{ weaponsDetail.defenderBonus }}
        <i class="fas fa-shield-alt ms-1"></i>
      </div>
    </div>

    <div class="row pb-2" title="Weapons modifier" v-for="buff of weaponsDetail.appliedBuffs">
      <div class="col-auto" title="Weapons technology">
        <span v-if="buff.kind === 'star'">{{getSpecialistName(buff.specialistId, 'star')}}</span>
        <span v-if="buff.kind === 'carrier'">{{getSpecialistName(buff.specialistId, 'carrier')}}</span>
        {{ buff.amount }}
        <i class="fas fa-user-astronaut ms-1"></i>
      </div>
    </div>
  </details>
  <details v-if="star.ownedByPlayerId && !compact">
    <summary class="row pt-1 pb-1">
      <span class="col" title="Weapons">
        <span class="weapons-header"></span>
        Weapons
      </span>
      <span class="col text-end">
        {{ weaponsDetail.total }}
        <i class="fas fa-gun"></i>
      </span>
    </summary>

    <div class="row pt-1 pb-1">
      <div class="col" title="Weapons technology">
        Weapons technology
      </div>

      <div class="col text-end">
        {{ weaponsDetail.weaponsLevel }}
        <i class="fas fa-gun"></i>
      </div>
    </div>

    <div class="row pt-1 pb-1">
      <div class="col" title="Defender Bonus">
        Defender Bonus
      </div>

      <div class="col text-end">
        {{ weaponsDetail.defenderBonus }}
        <i class="fas fa-shield-alt"></i>
      </div>
    </div>

    <div class="row pt-1 pb-1" title="Weapons modifier" v-for="buff of weaponsDetail.appliedBuffs">
      <div class="col" title="Weapons technology">
        <span v-if="buff.kind === 'star'">{{getSpecialistName(buff.specialistId, 'star')}}</span>
        <span v-if="buff.kind === 'carrier'">{{getSpecialistName(buff.specialistId, 'carrier')}}</span>
      </div>

      <div class="col text-end">
        {{ buff.amount }}
        <i class="fas fa-user-astronaut"></i>
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {useGameServices} from "@/util/gameServices";
import type {Game, Player, Star} from "@/types/game";
import type {State} from "@/store";
import {useStore, type Store} from 'vuex';
import GameHelper from "@/services/gameHelper";
import type {Specialist} from "@solaris-common";

const props = defineProps<{
  star: Star,
  compact: boolean,
}>();

const gameServices = useGameServices();

const store: Store<State> = useStore();
const game = computed<Game>(() => store.state.game);
const starSpecialists = computed<Specialist[]>(() => store.state.starSpecialists);
const carrierSpecialists = computed<Specialist[]>(() => store.state.carrierSpecialists);

const getSpecialistName = (id: number, kind: 'star' | 'carrier') => {
  if (kind === 'carrier') {
    return carrierSpecialists.value.find((spec) => spec.id === id)!.name;
  } else if (kind === 'star') {
    return starSpecialists.value.find((spec) => spec.id === id)!.name;
  }
};

const starOwningPlayer = computed<Player | undefined>(() => props.star.ownedByPlayerId && GameHelper.getPlayerById(game.value, props.star.ownedByPlayerId) || undefined);

const carriersInOrbit = computed(() => GameHelper.getCarriersOrbitingStar(game.value, props.star));

const defenders = computed(() => starOwningPlayer.value ? [starOwningPlayer.value].concat(...carriersInOrbit.value.map(c => GameHelper.getPlayerById(game.value, c.ownedByPlayerId!)!)) : []);

const weaponsDetail = computed(() => gameServices.technologyService.getStarEffectiveWeaponsLevel(game.value, defenders.value, props.star, carriersInOrbit.value));
</script>

<style scoped>
.weapons-header {
  display: inline flow list-item;
}
</style>
