<template>
<tr :class="{'defeated':player.defeated}">
    <td><player-icon :playerId="player._id"/></td>
    <td><a href="javascript:;" @click="onOpenPlayerDetailRequested">{{player.alias}}</a></td>
    <td><a href="javascript:;" @click="goToEmpire"><i class="far fa-eye"></i></a></td>
    <td class="text-end" :class="displayStyle('scanning')">{{formatTech(player.research?.scanning?.level)}}</td>
    <td class="text-end" :class="displayStyle('hyperspace')">{{formatTech(player.research?.hyperspace?.level)}}</td>
    <td class="text-end" :class="displayStyle('terraforming')">{{formatTech(player.research?.terraforming?.level)}}</td>
    <td class="text-end" :class="displayStyle('experimentation')">{{formatTech(player.research?.experimentation?.level)}}</td>
    <td class="text-end" :class="displayStyle('weapons')">{{formatTech(player.research?.weapons?.level)}}</td>
    <td class="text-end" :class="displayStyle('banking')">{{formatTech(player.research?.banking?.level)}}</td>
    <td class="text-end" :class="displayStyle('manufacturing')">{{formatTech(player.research?.manufacturing?.level)}}</td>
    <td class="text-end" :class="displayStyle('specialists')">{{formatTech(player.research?.specialists?.level)}}</td>
</tr>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import GameHelper from '../../../../services/gameHelper'
import PlayerIcon from '../player/PlayerIcon.vue'
import {eventBusInjectionKey} from "@/eventBus";
import { inject, computed } from 'vue';
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import type {Game, Player} from "@/types/game";
import type {ResearchTypeNotRandom} from "@solaris-common";

const props = defineProps<{
  player: Player,
  userPlayer: Player | null,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;

const store = useGameStore();
const game = computed<Game>(() => store.game!);

const onOpenPlayerDetailRequested = () => emit('onOpenPlayerDetailRequested', props.player._id);

const goToEmpire = () => eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToPlayer, { player: props.player });

const formatTech = (n: number | undefined | null): string => {
  if (n !== null && n !== undefined) {
    return n.toString();
  } else {
    return '-';
  }
}

const hasHighestTechLevel = (research: ResearchTypeNotRandom) => {
  return GameHelper.playerHasHighestTechLevel(
    game.value,
    research,
    props.userPlayer!,
  );
};

const hasLowestTechLevel = (research: ResearchTypeNotRandom) => {
  return GameHelper.playerHasLowestTechLevel(
    game.value,
    research,
    props.userPlayer!
  );
};

const displayStyle = (research: ResearchTypeNotRandom) => {
  if (props.player._id == props.userPlayer?._id) {
    return {
      "text-success": hasHighestTechLevel(research),
      "text-danger": hasLowestTechLevel(research)
    }
  }
};
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}

.defeated {
  opacity: 0.5;
}
</style>
