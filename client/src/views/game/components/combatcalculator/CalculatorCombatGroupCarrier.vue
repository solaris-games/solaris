<template>
  <calculator-combat-group-object @onRemove="remove">
    <template v-slot:icon>
      <i class="fas fa-rocket"></i>
    </template>
    <template v-slot:header>
      <button
        class="btn btn-sm btn-outline-success me-1"
        @click="selectCarrier"
      >
        <i class="fas fa-location-pin"></i>
      </button>
    </template>
    <template v-slot:inputs>
      <div class="input-group mb-1">
        <span class="input-group-text">
          <i class="fas fa-rocket"></i>
        </span>
        <input
          type="number"
          class="form-control form-control-sm ships-input"
          v-model.number="model.ships"
          min="0"
          placeholder="Ships"
        />
      </div>
      <specialist-selection kind="carrier" v-model="model.specialistId" />
    </template>
  </calculator-combat-group-object>
</template>
<script setup lang="ts">
import type { CCCarrier } from "@/views/game/components/combatcalculator/types";
import CalculatorCombatGroupObject from "@/views/game/components/combatcalculator/CalculatorCombatGroupObject.vue";
import type { Carrier } from "@/types/game.ts";
import { useGameStore } from "@/stores/game.ts";
import SpecialistSelection from "@/views/game/components/combatcalculator/SpecialistSelection.vue";

const emit = defineEmits<{
  onRemove: [carrier: CCCarrier];
}>();

const model = defineModel<CCCarrier>({ required: true });

const store = useGameStore();

const remove = () => emit("onRemove", model.value);

const selectCarrier = () => {
  const cb = (carrier: Carrier | undefined) => {
    if (carrier) {
      model.value.specialistId = carrier.specialistId;
      model.value.ships = carrier.ships || 0;
    }
    store.setMenuState({ state: "combatCalculator", advanced: true });
  };

  store.setMenuState({ state: "selectCarrier", callback: cb });
};
</script>
<style scoped></style>
