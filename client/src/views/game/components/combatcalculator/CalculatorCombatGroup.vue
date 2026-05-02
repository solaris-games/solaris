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
import type {CombatBaseCarrier, CombatBasePlayer, CombatBaseStar, CombatGroup} from "@solaris/common";
import CalculatorCombatGroupStar from "@/views/game/components/combatcalculator/CalculatorCombatGroupStar.vue";
import CalculatorCombatGroupCarrier from "@/views/game/components/combatcalculator/CalculatorCombatGroupCarrier.vue";

type CG = CombatGroup<string, CombatBasePlayer<string>, CombatBaseStar<string>, CombatBaseCarrier<string>>;

const props = defineProps<{
  validationErrors: string[],
  groups: CG[];
  index: number;
}>();

const emit = defineEmits<{
  onGroupRemove: [group: CG],
}>();

const model = defineModel<CG>({ required: true });

const hasError = computed(() => props.validationErrors.length > 0);

const remove = () => emit('onGroupRemove', model.value!);

const otherGroupHasStar = computed(() => Boolean(props.groups.find((g) => g !== model.value && g.star)));

const addStar = () => {
  model.value!.star = {
    _id: "star",
    ships: 0,
    specialistId: null,
    ownedByPlayerId: null,
  };
};

const addCarrier = () => {
  const idx = model.value!.carriers.length;

  model.value!.carriers.push({
    _id: `carrier${idx}`,
    ships: 0,
    specialistId: null,
    specialistTargetedPlayers: [],
    ownedByPlayerId: null,
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
