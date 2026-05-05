<template>
  <calculator-combat-group-object kind="star" v-model="model" @onRemove="remove">
    <template v-slot:icon>
      <i class="fas fa-star"></i>
    </template>
  </calculator-combat-group-object>
</template>
<script setup lang="ts">
import type {CCStar} from "@/views/game/components/combatcalculator/types";
import CalculatorCombatGroupObject from "@/views/game/components/combatcalculator/CalculatorCombatGroupObject.vue";

const emit = defineEmits<{
  onRemove: [],
}>();

const model = defineModel<CCStar>({ required: true });

const remove = () => emit('onRemove');
</script>
<style scoped>
</style>
