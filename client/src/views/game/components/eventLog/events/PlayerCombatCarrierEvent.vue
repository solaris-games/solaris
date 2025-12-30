<template>
    <div>
        <p>
            Your forces have engaged the enemy in <span class="text-warning">carrier-to-carrier</span> combat.
        </p>
      <CombatEventSide title="Defender" :side="defenderSide" @onOpenPlayerDetailRequested="requestOpenPlayerDetail" />
      <CombatEventSide title="Attacker" :side="attackerSide" @onOpenPlayerDetailRequested="requestOpenPlayerDetail" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type {PlayerCombatCarrierEvent} from "@solaris-common";
import { useStore, type Store } from 'vuex';
import CombatEventSide from './CombatEventSide.vue';
import type { State } from '@/store';
import {createCarrierDefenderSide, createCarrierAttackerSide} from '@/types/combat';

const props = defineProps<{
  event: PlayerCombatCarrierEvent<string>
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string]
}>();

const store: Store<State> = useStore();

const game = store.state.game!;

const defenderSide = computed(() => createCarrierDefenderSide(game, props.event));

const attackerSide = computed(() => createCarrierAttackerSide(game, props.event));

const requestOpenPlayerDetail = (playerId: string) => {
  emit('onOpenPlayerDetailRequested', playerId);
};

</script>

<style scoped>
</style>
