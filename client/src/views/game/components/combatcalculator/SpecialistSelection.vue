<template>
  <div class="input-group mb-1">
    <span class="input-group-text">
      <i class="fas fa-user-astronaut"></i>
    </span>
    <select class="form-control form-control-sm" v-model="model">
      <option :value="null">None</option>
      <option v-for="s in specialists" :key="s.id" :value="s.id">
        {{ s.name }}
      </option>
    </select>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "@/stores/game";

const model = defineModel<number | null>();

const props = defineProps<{
  kind: "carrier" | "star";
}>();

const store = useGameStore();
const specialists = computed(() => {
  if (props.kind === "carrier") {
    return store.carrierSpecialists;
  } else if (props.kind === "star") {
    return store.starSpecialists;
  }
});
</script>
<style scoped></style>
