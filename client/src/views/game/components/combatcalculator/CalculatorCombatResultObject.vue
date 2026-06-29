<template>
  <tr>
    <td><slot></slot></td>
    <td>{{ object.shipsBefore }}</td>
    <td>{{ object.shipsLost }}</td>
    <td>{{ object.shipsAfter }}</td>
  </tr>
</template>
<script setup lang="ts">
import type { DetailedCombatResultObject } from "@solaris/common";

const props = defineProps<{
  object: DetailedCombatResultObject;
}>();
</script>
<style scoped></style>
