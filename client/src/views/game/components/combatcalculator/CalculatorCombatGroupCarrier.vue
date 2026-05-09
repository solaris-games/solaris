<template>
<calculator-combat-group-object kind="carrier" v-model="model" @onRemove="remove">
  <template v-slot:icon>
    <i class="fas fa-rocket"></i>
  </template>
</calculator-combat-group-object>
</template>
<script setup lang="ts">
import type {CCCarrier} from "@/views/game/components/combatcalculator/types";
import CalculatorCombatGroupObject from "@/views/game/components/combatcalculator/CalculatorCombatGroupObject.vue";

const emit = defineEmits<{
  onRemove: [carrier: CCCarrier],
}>();

const model = defineModel<CCCarrier>({ required: true });

const remove = () => emit('onRemove', model.value);
</script>
<style scoped>
</style>
