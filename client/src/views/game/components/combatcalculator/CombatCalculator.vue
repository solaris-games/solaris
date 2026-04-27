<template>
  <div class="menu-page container">
    <menu-title title="Combat Calculator" @onCloseRequested="onCloseRequested"/>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" v-model="isAdvanced" id="chkCombatCalculatorAdvanced">
      <label class="form-check-label" for="chkCombatCalculatorAdvanced">
        Advanced
      </label>
    </div>

    <basic-combat-calculator v-if="!isAdvanced" :carrierId="carrierId" />
    <advanced-combat-calculator v-else />
  </div>
</template>

<script setup lang="ts">
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import {eventBusInjectionKey} from "@/eventBus";
import {inject, ref} from "vue";
import MenuTitle from "@/views/game/components/MenuTitle.vue";
import BasicCombatCalculator from "@/views/game/components/combatcalculator/BasicCombatCalculator.vue";
import AdvancedCombatCalculator from "@/views/game/components/combatcalculator/AdvancedCombatCalculator.vue";

const props = defineProps<{
  carrierId?: string,
}>();

const emit = defineEmits<{
  onCloseRequested: [e: Event],
}>();

const eventBus = inject(eventBusInjectionKey)!;

const isAdvanced = ref(false);

const onCloseRequested = (e: Event) => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandUnselectAllStars);
  eventBus.emit(MapCommandEventBusEventNames.MapCommandUnselectAllCarriers);

  emit('onCloseRequested', e);
};

</script>

<style scoped>
</style>
