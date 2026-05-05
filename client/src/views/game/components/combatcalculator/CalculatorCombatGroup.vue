<template>
  <div class="cg-box" :class="hasError ? 'cg-box-error' : 'cg-box-ok'">
    <p>Group {{ index }}</p>
    <div class="cg-box-objects">
      <calculator-combat-group-star v-if="model.star" v-model="model.star" />
      <calculator-combat-group-carrier v-for="(carrier, idx) in model.carriers" :key="idx" v-model="model.carriers[idx]" />
    </div>
    <div class="cg-box-group">
      <button class="btn btn-success" :disabled="otherGroupHasStar" @click="addStar">
        Add Star
      </button>
      <button class="btn btn-success" @click="addCarrier">
        Add Carrier
      </button>
      <button class="btn btn-danger" @click="remove">
        Delete
      </button>
    </div>
    <div class="cg-box-footer">
      <p v-for="err of validationErrors" class="text-danger">{{ err }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import CalculatorCombatGroupStar from "@/views/game/components/combatcalculator/CalculatorCombatGroupStar.vue";
import CalculatorCombatGroupCarrier from "@/views/game/components/combatcalculator/CalculatorCombatGroupCarrier.vue";
import type {CCGroup} from "@/views/game/components/combatcalculator/types.ts";

const props = defineProps<{
  validationErrors: string[],
  groups: CCGroup[];
  index: number;
}>();

const emit = defineEmits<{
  onGroupRemove: [group: CCGroup],
}>();

const model = defineModel<CCGroup>({ required: true });

const hasError = computed(() => props.validationErrors.length > 0);

const remove = () => emit('onGroupRemove', model.value!);

const otherGroupHasStar = computed(() => Boolean(props.groups.find((g) => g !== model.value && g.star)));

const addStar = () => {
  model.value!.star = {
    ships: 0,
    specialistId: null,
  };
};

const addCarrier = () => {
  model.value!.carriers.push({
    ships: 0,
    specialistId: null,
  });
};
</script>
<style scoped>
.cg-box {
  display: flex;
  flex-direction: column;
  border: blue 2px solid;
  border-radius: 4px;
}

.cg-box-error {
  border-color: red;
}

.cg-box-ok {
  border-color: blue;
}

.cg-box-group {
  display: flex;
  flex-direction: row;
}

.cg-box-objects {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}
</style>
