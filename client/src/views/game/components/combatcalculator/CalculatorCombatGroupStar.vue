<template>
<div class="cg-group-star p-2" v-if="model">
  <div class="cg-group-star-header mb-1">
    <span><i class="fas fa-star"></i></span>
    <button class="btn btn-sm btn-danger" @click="remove">
      <i class="fas fa-times"></i>
    </button>
  </div>
  <div class="input-group mb-1">
    <span class="input-group-text">
      <i class="fas fa-rocket"></i>
    </span>
    <input type="number" class="form-control form-control-sm" v-model.number="model.ships" min="0" placeholder="Ships" />
  </div>
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
  justify-content: space-between;
}
</style>
