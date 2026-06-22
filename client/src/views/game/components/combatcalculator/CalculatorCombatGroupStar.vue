<template>
  <calculator-combat-group-object kind="star" v-model="model" @onRemove="remove">
    <template v-slot:icon>
      <i class="fas fa-star"></i>
    </template>
    <template v-slot:header>
      <button class="btn btn-sm btn-outline-success me-1" @click="selectStar">
        <i class="fas fa-location-pin"></i>
      </button>
    </template>
  </calculator-combat-group-object>
</template>
<script setup lang="ts">
import type {CCStar} from "@/views/game/components/combatcalculator/types";
import CalculatorCombatGroupObject from "@/views/game/components/combatcalculator/CalculatorCombatGroupObject.vue";
import {useGameStore} from "@/stores/game.ts";
import type {Star} from "@/types/game.ts";

const emit = defineEmits<{
  onRemove: [],
}>();

const model = defineModel<CCStar>({ required: true });

const store = useGameStore();

const remove = () => emit('onRemove');

const selectStar = () => {
  const cb = (star: Star | undefined) => {
    if (star) {
      model.value.specialistId = star.specialistId;
      model.value.ships = star.ships || 0;
    }
    store.setMenuState({ state: 'combatCalculator', advanced: true });
  };

  store.setMenuState({ state: 'selectStar', callback: cb });
};
</script>
<style scoped>
</style>
