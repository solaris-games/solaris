<template>
  <div class="cg-group-object p-2">
    <div class="cg-group-object-header mb-1">
      <span>
        <slot name="icon"></slot>
      </span>
      <div>
        <slot name="header"></slot>
        <button class="btn btn-sm btn-danger" @click="remove">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
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
    <specialist-selection :kind="kind" v-model="model.specialistId" />
  </div>
</template>
<script setup lang="ts">
import SpecialistSelection from "@/views/game/components/combatcalculator/SpecialistSelection.vue";

const props = defineProps<{
  kind: "star" | "carrier";
}>();

const model = defineModel<{
  specialistId: number | null;
  ships: number;
}>({ required: true });

const emit = defineEmits<{ 1; onRemove: [] }>();

const remove = () => emit("onRemove");
</script>
<style scoped>
.cg-group-object {
  display: flex;
  flex-direction: column;
  border: 1px white solid;
  border-radius: 4px;
  flex-basis: 160px;
  flex-grow: 1;
  max-width: 220px;
}

.cg-group-object-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
