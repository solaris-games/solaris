<template>
  <p v-if="hasMultiple" class="combat-group-attack">
    <span class="weapons-level" v-for="[weaponsLevel, groups] of groupedAttack">Weapons {{weaponsLevel}} against {{formatGroups(groups)}}</span>
  </p>
  <p v-else class="combat-group-attack">
    <span class="weapons-level" v-for="[weaponsLevel, _d] of groupedAttack">Weapons {{weaponsLevel}}</span>
  </p>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import {type CombatResultGroup, groupBy, type WeaponsDetail} from "@solaris/common";

const props = defineProps<{
  group: CombatResultGroup<string>,
}>();

const groupedAttack = computed(() => {
  return groupBy(Object.entries(props.group.attackAgainst), ([_n, wd]) => wd.total);
});

const hasMultiple = computed(() => groupedAttack.value.size > 1);

const formatGroups = (gr: [string, WeaponsDetail][]) => {
  return gr.map(([n, _]) => n).join(", ");
};
</script>
<style scoped>
.combat-group-attack {
  margin-bottom: 0;
  padding-top: 4px;
}

.weapons-level {
  font-style: italic;
}
</style>
