<template>
<div class="cg-group-star" v-if="model">
  <div class="cg-group-star-header">
    <p>{{ model._id }}</p>
    <button class="btn btn-sm btn-danger" @click="remove">
      X
    </button>
  </div>
  <input type="number" class="form-control form-control-sm" v-model.number="model.ships" min="0" placeholder="Ships" />
  <specialist-selection kind="star" v-model="model.specialistId" />
</div>
</template>
<script setup lang="ts">
import type {CombatBaseStar} from "@solaris/common";
import SpecialistSelection from "@/views/game/components/combatcalculator/SpecialistSelection.vue";

const emit = defineEmits<{
  onRemove: [],
}>();

const model = defineModel<CombatBaseStar<string>>({ required: true });

const remove = () => emit('onRemove');
</script>
<style scoped>
.cg-group-star {
  display: flex;
  flex-direction: row;
}

.cg-group-star-header {
  display: flex;
  flex-direction: column;
}
</style>
