<template>

</template>
<script setup lang="ts">
import type {CombatBaseCarrier, CombatBasePlayer, CombatBaseStar, DetailedCombatResult} from "@solaris/common";

const props = defineProps<{
  result: DetailedCombatResult<string, CombatBasePlayer<string>, CombatBaseStar<string>, CombatBaseCarrier<string>>,
}>();
</script>
<style scoped>

</style>
