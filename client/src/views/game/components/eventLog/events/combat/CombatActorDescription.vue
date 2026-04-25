<template>
  <td class="combat-actor-name">
    <span>
      <specialist-icon :specialist="specialist" :default-icon="kind === 'star' ? 'star' : 'rocket'" />
    </span>
    {{ name }}
  </td>
</template>

<script setup lang="ts">
import SpecialistIcon from "../../../specialist/SpecialistIcon.vue";
import type {Specialist} from "@solaris/common";

const props = defineProps<{
  name: string,
  specialist: Specialist | null,
  kind: 'star' | 'carrier',
}>();
</script>
<style scoped>
.combat-actor-name {
  padding-left: 16px;
  width: 50%;
}
</style>
