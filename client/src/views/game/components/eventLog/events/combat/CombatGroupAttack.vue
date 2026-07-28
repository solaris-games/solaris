<template>
  <p
    v-if="hasMultiple"
    v-for="[weaponsLevel, groups] of groupedAttack"
    class="combat-group-attack"
  >
    <span class="weapons-level"
      >Weapons {{ weaponsLevel }} against group(s):
      {{ formatGroups(groups) }}</span
    >
  </p>
  <p v-else class="combat-group-attack">
    <span class="weapons-level" v-for="[weaponsLevel, _d] of groupedAttack"
      >Weapons {{ weaponsLevel }}</span
    >
  </p>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { groupBy, type WeaponsDetail } from "@solaris/common";

const props = defineProps<{
  attackAgainst: Record<number, WeaponsDetail>;
}>();

const groupedAttack = computed(() => {
  return groupBy(Object.entries(props.attackAgainst), ([_n, wd]) => wd.total);
});

const formatGroups = (gr: [string, WeaponsDetail][]) => {
  return gr.map(([n, _]) => n).join(", ");
};

const hasMultiple = computed(() => groupedAttack.value.size > 1);
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
