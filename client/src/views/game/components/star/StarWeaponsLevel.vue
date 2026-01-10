<template>
  <details v-if="star.ownedByPlayerId">
    <summary class="pb-2">
      <span title="Weapons" v-if="compact">
        {{ weaponsDetail.total }} <i class="fas fa-gun ms-1"></i>
      </span>
      <span title="Weapons" v-else>
        <i class="fas fa-gun pe-2"></i>Weapons {{ weaponsDetail.total }}
      </span>
    </summary>

    <p title="Weapons technology">
      <i class="fas fa-gun pe-2"></i>Weapons technology {{ weaponsDetail.weaponsLevel }}
    </p>

    <p title="Defender Bonus">
      <i class="fas fa-shield-alt pe-2"></i>Defender Bonus {{ weaponsDetail.defenderBonus }}
    </p>

    <p title="Weapons modified" v-for="buff of weaponsDetail.appliedBuffs">
      <i class="fas fa-user-astronaut pe-2"></i>
      <span v-if="buff.kind === 'star'">{{getSpecialistName(buff.specialistId, 'star')}} {{ buff.amount }}</span>
      <span v-if="buff.kind === 'carrier'">{{getSpecialistName(buff.specialistId, 'carrier')}} {{ buff.amount }}</span>
    </p>
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

</style>
