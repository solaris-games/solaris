<template>
  <div class="menu-page container">
    <menu-title title="Combat Calculator" @onCloseRequested="onCloseRequested">
      <a :href="documentationUrl + '/combat.html'" target="_blank" class="btn btn-outline-info btn-sm" title="Documentation"><i class="far fa-question-circle"></i></a>
    </menu-title>

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
import {eventBusInjectionKey} from "@/eventBus";
import { MapCommandEventBusEventNames } from '@solaris/map-rendering';
import {inject, ref, computed} from "vue";
import MenuTitle from "@/views/game/components/MenuTitle.vue";
import BasicCombatCalculator from "@/views/game/components/combatcalculator/BasicCombatCalculator.vue";
import AdvancedCombatCalculator from "@/views/game/components/combatcalculator/AdvancedCombatCalculator.vue";

const props = defineProps<{
  carrierId?: string,
  advanced: boolean,
}>();

const emit = defineEmits<{
  onCloseRequested: [e: Event],
}>();

const eventBus = inject(eventBusInjectionKey)!;

const isAdvanced = ref(props.advanced);

const documentationUrl = computed(() => import.meta.env.VUE_APP_DOCUMENTATION_URL);

const onCloseRequested = (e: Event) => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandUnselectAllStars);
  eventBus.emit(MapCommandEventBusEventNames.MapCommandUnselectAllCarriers);

  emit('onCloseRequested', e);
};

</script>

<style scoped>
</style>
