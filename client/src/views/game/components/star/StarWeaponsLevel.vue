<template>
  <details v-if="star.ownedByPlayerId && compact">
    <summary>
    <span title="Weapons">
     Weapons: {{ weaponsDetail.total }} <i class="fas fa-gun ms-1"></i>
    </span>
    </summary>

    <p title="Weapons technology">
      <span>{{ weaponsDetail.weaponsLevel }}</span>
      <i class="fas fa-gun ms-2"></i>
    </p>

    <p title="Defender Bonus">
      <span>{{ weaponsDetail.defenderBonus }}</span>
      <i class="fas fa-shield-alt ms-2"></i>
    </p>

    <p title="Weapons modified" v-for="buff of weaponsDetail.appliedBuffs">
      <span v-if="buff.kind === 'star'">Star Specialist {{ buff.amount }}</span>
      <span v-if="buff.kind === 'carrier'">Carrier Specialist {{ buff.amount }}</span>
      <i class="fas fa-user-astronaut ms-2"></i>
    </p>
  </details>
  <details v-if="star.ownedByPlayerId && !compact">
    <summary>
      <span title="Weapons">
        Weapons {{ weaponsDetail.total }}
        <i class="fas fa-gun ms-2"></i>
      </span>
    </summary>

    <p title="Weapons technology">
      Weapons technology {{ weaponsDetail.weaponsLevel }}
      <i class="fas fa-gun ms-2"></i>
    </p>

    <p title="Defender Bonus">
      Defender Bonus {{ weaponsDetail.defenderBonus }}
      <i class="fas fa-shield-alt ms-2"></i>
    </p>

    <p title="Weapons modified" v-for="buff of weaponsDetail.appliedBuffs">
      <span v-if="buff.kind === 'star'">{{ buff.amount }} <i class="fas fa-star"></i></span>
      <span v-if="buff.kind === 'carrier'">{{ buff.amount }} <i class="fas fa-rocket"></i></span>
      <i class="fas fa-user-astronaut ms-2"></i>
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

const props = defineProps<{
  star: Star,
  compact: boolean,
}>();

const gameServices = useGameServices();

const store: Store<State> = useStore();
const game = computed<Game>(() => store.state.game);

const starOwningPlayer = computed<Player | undefined>(() => props.star.ownedByPlayerId && GameHelper.getPlayerById(game.value, props.star.ownedByPlayerId) || undefined);

const carriersInOrbit = computed(() => GameHelper.getCarriersOrbitingStar(game.value, props.star));

const defenders = computed(() => starOwningPlayer.value ? [starOwningPlayer.value].concat(...carriersInOrbit.value.map(c => GameHelper.getPlayerById(game.value, c.ownedByPlayerId!)!)) : []);

const weaponsDetail = computed(() => gameServices.technologyService.getStarEffectiveWeaponsLevel(game.value, defenders.value, props.star, carriersInOrbit.value));
</script>

<style scoped>

</style>
