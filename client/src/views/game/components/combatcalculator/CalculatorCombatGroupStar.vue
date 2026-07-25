<template>
  <calculator-combat-group-object @onRemove="remove">
    <template v-slot:icon>
      <i class="fas fa-star"></i>
    </template>
    <template v-slot:header>
      <button class="btn btn-sm btn-outline-success me-1" @click="selectStar">
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
      <specialist-selection kind="star" v-model="model.specialistId" />
      <div class="form-check mb-1">
        <label class="form-check-label">
          Home Star
          <input
            class="form-check-input"
            type="checkbox"
            v-model="model.isHomeStar"
          />
        </label>
      </div>
      <div class="form-check mb-1">
        <label class="form-check-label">
          Asteroid Field
          <input
            class="form-check-input"
            type="checkbox"
            v-model="model.isAsteroidField"
          />
        </label>
      </div>
    </template>
  </calculator-combat-group-object>
</template>
<script setup lang="ts">
import type { CCStar } from "@/views/game/components/combatcalculator/types";
import CalculatorCombatGroupObject from "@/views/game/components/combatcalculator/CalculatorCombatGroupObject.vue";
import { useGameStore } from "@/stores/game.ts";
import type { Star } from "@/types/game.ts";
import SpecialistSelection from "@/views/game/components/combatcalculator/SpecialistSelection.vue";

const emit = defineEmits<{
  onRemove: [];
}>();

const model = defineModel<CCStar>({ required: true });

const store = useGameStore();

const remove = () => emit("onRemove");

const selectStar = () => {
  const cb = (star: Star | undefined) => {
    if (star) {
      model.value.specialistId = star.specialistId;
      model.value.ships = star.ships || 0;
    }
    store.setMenuState({ state: "combatCalculator", advanced: true });
  };

  store.setMenuState({ state: "selectStar", callback: cb });
};
</script>
<style scoped></style>
