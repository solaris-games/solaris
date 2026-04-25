<template>
  <p></p>
</template>
<script setup lang="ts">
import type {CombatResultGroup} from "@solaris/common";

const props = defineProps<{
  group: CombatResultGroup<string>,
}>();
</script>
<style scoped>

</style>
