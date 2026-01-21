<template>
    <div v-if="event">
        <p>
            Your forces have engaged the enemy in <span class="text-warning">carrier-to-star</span> combat at <star-label :starId="event.data.starId" :starName="event.data.starName"/>.
        </p>
        <CombatEventSide title="Defender" :side="defenderSide" @onOpenPlayerDetailRequested="requestOpenPlayerDetail" />
        <CombatEventSide title="Attacker" :side="attackerSide" @onOpenPlayerDetailRequested="requestOpenPlayerDetail" />

        <hr class="mt-0"/>

        <div v-if="event.data.captureResult">
          <p>
            The star <star-label :starId="event.data.starId" :starName="event.data.starName"/> has been captured
            by <a href="javascript:;" @click="emit('onOpenPlayerDetailRequested', event.data.captureResult.capturedById)">{{event.data.captureResult.capturedByAlias}}</a>
            <span v-if="getOriginalStarOwner(game, event)">
              from <a href="javascript:;" @click="emit('onOpenPlayerDetailRequested', getOriginalStarOwner(game, event)!._id)">{{getOriginalStarOwner(game, event)!.alias}}</a>
            </span>
            .
          </p>
          <p v-if="event.data.captureResult?.specialistDestroyed">
            The specialist at <star-label :starId="event.data.starId" :starName="event.data.starName"/> was destroyed due to the intense combat.
          </p>
          <p v-if="event.data.captureResult?.captureReward">
            <a href="javascript:;" @click="emit('onOpenPlayerDetailRequested', event.data.captureResult.capturedById)">{{event.data.captureResult.capturedByAlias}}</a> is awarded
            <span class="text-warning">${{event.data.captureResult.captureReward}}</span> credits for destroying economic infrastructure.
          </p>
        </div>
      <div v-if="!event.data.captureResult">
        <p>
          The star <star-label :starId="event.data.starId" :starName="event.data.starName"/> remains under the control of
          <a href="javascript:;" @click="() => originalOwnerId && emit('onOpenPlayerDetailRequested', originalOwnerId)">{{originalOwnerId ? gameHelper.getPlayerById(game, originalOwnerId)!.alias : '???'}}</a>.
        </p>
      </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StarLabel from '../../star/StarLabel.vue'
import type {PlayerCombatStarEvent} from "@solaris-common";
import { useStore, type Store } from 'vuex';
import CombatEventSide from './CombatEventSide.vue';
import type { State } from '@/store';
import {createStarAttackerSide, createStarDefenderSide, getOriginalStarOwner} from '@/services/combat';
import gameHelper from '../../../../../services/gameHelper';
import type {Game} from "@/types/game";

const props = defineProps<{
  event: PlayerCombatStarEvent<string>
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string]
}>();

const store: Store<State> = useStore();

const game: Game = store.state.game!;

const defenderSide = computed(() => createStarDefenderSide(game, props.event));

const attackerSide = computed(() => createStarAttackerSide(game, props.event));

const originalOwnerId = computed(() => props.event.data.combatResult.star?.ownedByPlayerId);

const requestOpenPlayerDetail = (playerId: string) => {
  emit('onOpenPlayerDetailRequested', playerId);
};
</script>

<style scoped>
</style>
