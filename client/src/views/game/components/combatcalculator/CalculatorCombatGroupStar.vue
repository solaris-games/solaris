<template>
<div class="cg-group-star" v-if="model">
  <div class="cg-group-star-header">
    <p>Star</p>
    <button class="btn btn-sm btn-danger" @click="remove">
      X
    </button>
  </div>
  <input type="number" class="form-control form-control-sm" v-model.number="model.ships" min="0" placeholder="Ships" />
  <specialist-selection kind="star" v-model="model.specialistId" />
</div>
</template>
<script setup lang="ts">
import SpecialistSelection from "@/views/game/components/combatcalculator/SpecialistSelection.vue";
import type {CCStar} from "@/views/game/components/combatcalculator/types";

const emit = defineEmits<{
  onRemove: [],
}>();

const model = defineModel<CCStar>({ required: true });

const remove = () => emit('onRemove');
</script>
<style scoped>
.cg-group-star {
  display: flex;
  flex-direction: column;
  border: 1px white solid;
  border-radius: 4px;
}

.cg-group-star-header {
  display: flex;
  flex-direction: row;
}
</style>
