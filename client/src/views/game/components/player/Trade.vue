<template>
<div class="menu-page container" v-if="player">
    <menu-title title="Trade" @onCloseRequested="onCloseRequested">
      <button @click="onOpenPlayerDetailRequested" class="btn btn-sm btn-outline-primary"><i class="fas fa-user"></i> Profile</button>
      <button @click="onOpenPrevPlayerDetailRequested" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-chevron-left"></i></button>
      <button @click="onOpenNextPlayerDetailRequested" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-chevron-right"></i></button>
      <button @click="panToPlayer" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-eye"></i></button>
    </menu-title>

    <player-title :player="player"/>

    <player-trade :playerId="playerId"/>

    <h4 v-if="player && player.research" class="mt-2">Technology</h4>

    <research v-if="player && player.research" :playerId="player._id"/>

    <trade-history v-if="player" :toPlayerId="player._id"/>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import MenuTitle from '../MenuTitle.vue'
import PlayerTitle from './PlayerTitle.vue'
import Research from './Research.vue'
import PlayerTrade from './PlayerTrade.vue'
import TradeHistory from './TradeHistory.vue'
import GameHelper from '../../../../services/gameHelper'
import {eventBusInjectionKey} from "@/eventBus";
import { inject } from 'vue';
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import type {Game, Player} from "@/types/game";

const props = defineProps<{
  playerId: string,
}>();

const emit = defineEmits<{
  onCloseRequested: [],
  onOpenTradeRequested: [playerId: string],
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const onCloseRequested = () => emit('onCloseRequested');

const eventBus = inject(eventBusInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.game);
const player = computed(() => GameHelper.getPlayerById(game.value, props.playerId)!);
const playerIndex = computed(() => game.value.galaxy.players.indexOf(player.value));
const leaderboard = computed(() => GameHelper.getSortedLeaderboardPlayerList(game.value));

const panToPlayer = () => eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToPlayer, { player: player.value });

const onOpenTradeRequested = (player: Player) => emit('onOpenTradeRequested', player._id);

const onOpenPlayerDetailRequested = () => {
  const player = game.value.galaxy.players[playerIndex.value];

  emit('onOpenPlayerDetailRequested', player._id);
};

const onOpenPrevPlayerDetailRequested = () => {
  let prevLeaderboardIndex = leaderboard.value.indexOf(player.value) - 1;

  if (prevLeaderboardIndex < 0) {
    prevLeaderboardIndex = leaderboard.value.length - 1;
  }

  const prevPlayer = leaderboard.value[prevLeaderboardIndex];

  onOpenTradeRequested(prevPlayer);
};

const onOpenNextPlayerDetailRequested = () => {
  let nextLeaderboardIndex = leaderboard.value.indexOf(player.value) + 1;

  if (nextLeaderboardIndex > leaderboard.value.length - 1) {
    nextLeaderboardIndex = 0;
  }

  const nextPlayer = leaderboard.value[nextLeaderboardIndex];

  onOpenTradeRequested(nextPlayer);
};
</script>

<style scoped>
</style>
