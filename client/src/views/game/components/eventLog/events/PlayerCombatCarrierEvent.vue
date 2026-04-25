<template>
    <div>
        <p>
            Your forces have engaged the enemy in <span class="text-warning">carrier-to-carrier</span> combat.
        </p>

      <combat-event-group v-for="(group, groupIndex) of event.data.groups" :title="getTitle(group, groupIndex)" :group="group" @onOpenPlayerDetailRequested="requestOpenPlayerDetail" :groupIndex="groupIndex" />
    </div>
</template>

<script setup lang="ts">
import type {CombatResultGroup, PlayerCombatCarrierEvent} from "@solaris/common";
import CombatEventGroup from './combat/CombatEventGroup.vue';

const props = defineProps<{
  event: PlayerCombatCarrierEvent<string>
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string]
}>();

const getTitle = (group: CombatResultGroup<string>, groupIndex: number) => {
  return `Group ${groupIndex}`;
};

const requestOpenPlayerDetail = (playerId: string) => {
  emit('onOpenPlayerDetailRequested', playerId);
};
</script>

<style scoped>
</style>
