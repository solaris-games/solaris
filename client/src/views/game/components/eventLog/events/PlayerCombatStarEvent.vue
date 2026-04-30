<template>
    <div v-if="event">
        <p>
            Your forces have engaged the enemy in <span class="text-warning">carrier-to-star</span> combat at <star-label :starId="starGroup.star!.starId" :starName="starGroup.star!.starName"/>.
        </p>

        <combat-event-group v-for="(group, groupIndex) of event.data.groups" :title="getTitle(group, groupIndex)" :group="group" @onOpenPlayerDetailRequested="requestOpenPlayerDetail" :groupIndex="groupIndex" />

        <hr class="mt-0"/>

        <div v-if="captureResult">
          <p>
            <span v-if="originalOwner">
              <a href="javascript:;" @click="emit('onOpenPlayerDetailRequested', originalOwner._id)">{{originalOwner.alias}}</a>'s
            </span>
            <span v-else>The</span>
             star <star-label :starId="starGroup.star!.starId" :starName="starGroup.star!.starName"/> has been captured
            by <a href="javascript:;" @click="emit('onOpenPlayerDetailRequested', captureResult.capturedById)">{{captureResult.capturedByAlias}}</a>.
          </p>
          <p v-if="captureResult?.specialistDestroyed">
            The specialist at <star-label :starId="starGroup.star!.starId" :starName="starGroup.star!.starName"/> was destroyed due to the intense combat.
          </p>
          <p v-if="captureResult?.captureReward">
            <a href="javascript:;" @click="emit('onOpenPlayerDetailRequested', captureResult.capturedById)">{{captureResult.capturedByAlias}}</a> is awarded
            <span class="text-warning">${{captureResult.captureReward}}</span> credits for destroying economic infrastructure.
          </p>
        </div>
      <div v-if="!captureResult">
        <p>
          The star <star-label :starId="starGroup.star!.starId" :starName="starGroup.star!.starName"/> remains under the control of
          <a href="javascript:;" @click="() => originalOwnerId && emit('onOpenPlayerDetailRequested', originalOwnerId)">{{originalOwnerId ? gameHelper.getPlayerById(game, originalOwnerId)!.alias : '???'}}</a>.
        </p>
      </div>
    </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { computed } from 'vue';
import StarLabel from '../../star/StarLabel.vue'
import type {CombatResultGroup, PlayerCombatStarEvent} from "@solaris/common";
import CombatEventGroup from './combat/CombatEventGroup.vue';
import gameHelper from '../../../../../services/gameHelper';
import type {Game} from "@/types/game";
import GameHelper from "../../../../../services/gameHelper";

const props = defineProps<{
  event: PlayerCombatStarEvent<string>
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string]
}>();

const store = useGameStore();
const game: Game = store.game!;

const starGroup = computed(() => props.event.data.groups.find(g => Boolean(g.star))!);
const originalOwnerId = computed(() => starGroup.value?.star!.ownedByPlayerId);
const captureResult = computed(() => starGroup.value?.star?.captureResult);
const originalOwner = computed(() => GameHelper.getPlayerById(game, originalOwnerId.value));

const getTitle = (group: CombatResultGroup<string>, groupIndex: number) => {
  if (group.star) {
    return "Defender";
  } else {
    return `Attacker ${groupIndex}`;
  }
};

const requestOpenPlayerDetail = (playerId: string) => {
  emit('onOpenPlayerDetailRequested', playerId);
};
</script>

<style scoped>
</style>
