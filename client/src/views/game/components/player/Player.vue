<template>
<div class="menu-page container">
    <menu-title title="Player" @onCloseRequested="onCloseRequested">
      <span class="me-2" v-if="user && user.roles">
        <i class="fas fa-hands-helping" v-if="user.roles.contributor" title="This player is a contributor"></i>
        <i class="fas fa-code ms-1" v-if="user.roles.developer" title="This player is an active developer"></i>
        <i class="fas fa-user-friends ms-1" v-if="user.roles.communityManager" title="This player is an active community manager"></i>
        <i class="fas fa-dice ms-1" v-if="user.roles.gameMaster" title="This player is an active game master"></i>
      </span>
      <elo-rating v-if="user && is1v1Game" :user="user" class="me-2"/>
      <button @click="onOpenPrevPlayerDetailRequested" class="btn btn-sm btn-outline-info"><i class="fas fa-chevron-left"></i></button>
      <button @click="onOpenNextPlayerDetailRequested" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-chevron-right"></i></button>
      <button @click="panToPlayer" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-eye"></i></button>
    </menu-title>

    <overview v-if="player" :playerId="player._id"
      @onViewCompareIntelRequested="onViewCompareIntelRequested"
      @onOpenTradeRequested="onOpenTradeRequested"
      @onViewColourOverrideRequested="onViewColourOverrideRequested"
    />

    <h4 v-if="player" class="mt-2">Infrastructure</h4>

    <infrastructure v-if="player" :playerId="player._id"/>

    <yourInfrastructure v-if="player && userPlayer && player != userPlayer"
                    :comparePlayerId="player._id"/>

    <h4 v-if="player && player.research" class="mt-2">Technology</h4>

    <research v-if="player && player.research" :playerId="player._id"/>

    <loading-spinner :loading="isLoading" />

    <player-user-info v-if="player && !isLoading" :game="game" :player="player" :user="user" :userPlayer="userPlayer" @onOpenPurchasePlayerBadgeRequested="onOpenPurchasePlayerBadgeRequested" />

    <player-report
      v-if="player && player.isRealUser && userPlayer && player !== userPlayer"
      :playerId="player._id"
      @onOpenReportPlayerRequested="onOpenReportPlayerRequested"/>
</div>
</template>

<script setup lang="ts">
import MenuTitle from '../MenuTitle.vue'
import Overview from './Overview.vue'
import Infrastructure from '../shared/Infrastructure.vue'
import YourInfrastructure from './YourInfrastructure.vue'
import Research from './Research.vue'
import EloRating from './EloRating.vue'
import PlayerReport from './PlayerReport.vue'
import GameHelper from '../../../../services/gameHelper'
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import { inject, ref, computed, type Ref, onMounted } from 'vue';
import type { InGameUser, Player, UserPublic } from '@solaris-common'
import { useStore, type Store } from 'vuex';
import type { State } from "@/store";
import PlayerUserInfo from "@/views/game/components/player/PlayerUserInfo.vue";
import LoadingSpinner from "@/views/components/LoadingSpinner.vue";
import { getPlayerUser } from '@/services/typedapi/game'
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi'

const props = defineProps<{
  playerId: string,
}>();

const emit = defineEmits<{
  onCloseRequested: [],
  onViewCompareIntelRequested: [playerId: string],
  onViewColourOverrideRequested: [playerId: string],
  onOpenTradeRequested: [playerId: string],
  onOpenPurchasePlayerBadgeRequested: [playerId: string],
  onOpenReportPlayerRequested: [{ playerId: string }],
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const store: Store<State> = useStore();

const isLoading = ref(false);
const player: Ref<Player<string> | null> = ref(null);
const user: Ref<InGameUser<string> | null> = ref(null);
const userPlayer: Ref<Player<string> | null> = ref(null);
const leaderboard: Ref<Player<string>[] | null> = ref(null);
const playerIndex = ref(0);

const game = computed(() => store.state.game!);

onMounted(async () => {
  isLoading.value = true;

  player.value = GameHelper.getPlayerById(store.state.game, props.playerId) || null;
  userPlayer.value = GameHelper.getUserPlayer(store.state.game) || null;
  playerIndex.value = store.state.game.galaxy.players.indexOf(player.value);
  leaderboard.value = GameHelper.getSortedLeaderboardPlayerList(store.state.game)

    // If there is a legit user associated with this user then get the
    // user info so we can show more info like achievements.
    if (store.state.userId && !player.value!.isOpenSlot && GameHelper.isNormalAnonymity(store.state.game)) {
      const response = await getPlayerUser(httpClient)(store.state.game._id, player.value!._id);

      if (isOk(response)) {
        user.value = response.data;
      } else {
        console.error(formatError(response));
      }
    }

  isLoading.value = false;
});

const is1v1Game = computed(() =>GameHelper.is1v1Game(store.state.game));
const onCloseRequested = () => emit('onCloseRequested');
const onViewCompareIntelRequested = (playerId: string) => emit('onViewCompareIntelRequested', playerId);
const onViewColourOverrideRequested = (playerId: string) => emit('onViewColourOverrideRequested', playerId);
const onOpenTradeRequested = () => emit('onOpenTradeRequested', props.playerId);
const onOpenReportPlayerRequested = () => emit('onOpenReportPlayerRequested', { playerId: props.playerId });
const panToPlayer = () => eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToPlayer, { player: player.value! });
const onOpenPlayerDetailRequested = (player: Player<string>) => emit('onOpenPlayerDetailRequested', player._id);
const onOpenPurchasePlayerBadgeRequested = () => emit('onOpenPurchasePlayerBadgeRequested', props.playerId);

const onOpenPrevPlayerDetailRequested = () => {
  let prevLeaderboardIndex = leaderboard.value!.indexOf(player.value!) - 1;
  if (prevLeaderboardIndex < 0) {
    prevLeaderboardIndex = leaderboard.value!.length - 1;
  }

  const prevPlayer = leaderboard.value![prevLeaderboardIndex];

  onOpenPlayerDetailRequested(prevPlayer);
};

const onOpenNextPlayerDetailRequested = () => {
  let nextLeaderboardIndex = leaderboard.value!.indexOf(player.value!) + 1;

  if (nextLeaderboardIndex > leaderboard.value!.length - 1) {
    nextLeaderboardIndex = 0;
  }

  const nextPlayer = leaderboard.value![nextLeaderboardIndex];

  onOpenPlayerDetailRequested(nextPlayer);
};
</script>

<style scoped>
</style>
