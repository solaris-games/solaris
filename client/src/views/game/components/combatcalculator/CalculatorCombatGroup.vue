<template>
  <div class="group-box" :class="hasError ? 'group-box-error' : 'group-box-ok'">
    <div>
      <button class="btn btn-danger" @click="remove">
        Delete
      </button>
    </div>
    <div class="group-box-footer">
      <p v-for="err of validationErrors" class="text-danger">{{ err }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type {CombatBaseCarrier, CombatBasePlayer, CombatBaseStar, CombatGroup} from "@solaris/common";

const props = defineProps<{
  validationErrors: string[],
}>();

const emit = defineEmits<{
  onGroupRemove: [group: CombatGroup<string, CombatBasePlayer<string>, CombatBaseStar<string>, CombatBaseCarrier<string>>],
}>();

const model = defineModel<CombatGroup<string, CombatBasePlayer<string>, CombatBaseStar<string>, CombatBaseCarrier<string>>>();

const hasError = computed(() => props.validationErrors.length > 0);

const remove = () => emit('onGroupRemove', model.value!);

</script>
<style scoped>
.group-box {
  display: flex;
  flex-direction: column;
  border: blue 2px solid;
  border-radius: 4px;
}

.group-box-error {
  border-color: red;
}

.group-box-ok {
  border-color: blue;
}
</style>
