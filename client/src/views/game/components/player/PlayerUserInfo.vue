<template>
  <h4 class="mt-2" v-if="canViewAchievements">Achievements</h4>

  <achievements v-if="canViewAchievements && user"
                :level="user.achievements.level"
                :victories="user.achievements.victories"
                :rank="user.achievements.rank"
                :renown="user.achievements.renown"/>

  <sendRenown v-if="userPlayer && player && canSendRenown" :player="player" :userPlayer="userPlayer" />

  <h4 class="mt-2" v-if="canAwardBadge">Badges</h4>

  <player-badges v-if="canAwardBadge && player"
                 :playerId="player._id"
                 @onOpenPurchasePlayerBadgeRequested="onOpenPurchasePlayerBadgeRequested"/>
</template>

<script setup lang="ts">
import PlayerBadges from "@/views/game/components/badges/PlayerBadges.vue";
import SendRenown from "@/views/game/components/player/SendRenown.vue";
import Achievements from "@/views/game/components/player/Achievements.vue";
import { computed } from 'vue';
import type {Player, InGameUser} from '@solaris-common';
import type {Game} from "@/types/game";
import GameHelper from "@/services/gameHelper";
import {useGameServices} from "@/util/gameServices";

const props = defineProps<{
  game: Game,
  player: Player<string>,
  userPlayer: Player<string> | null,
  user: InGameUser<string> | null,
}>();

const emit = defineEmits<{
  onOpenPurchasePlayerBadgeRequested: [playerId: string],
}>();

const serviceProvider = useGameServices();

const isGameFinished = computed(() => GameHelper.isGameFinished(props.game));
const isGameStarted = computed(() => GameHelper.isGameStarted(props.game));
const playersAreAnonymous = computed(() => isGameFinished.value ? serviceProvider.gameTypeService.isAnonymousAfterEnd(props.game) : serviceProvider.gameTypeService.isAnonymousGameDuringGame(props.game));

const canViewAchievements = computed(() => Boolean(props.player && props.player.isRealUser && props.user?.achievements));
const playerIsUser = computed(() => Boolean(props.player && props.userPlayer && props.userPlayer._id === props.player._id));

const canSendRenown = computed(() => Boolean(props.player && isGameStarted.value && props.player.isRealUser && props.userPlayer && !(playerIsUser.value) && (!playersAreAnonymous.value || isGameFinished.value)));
const canAwardBadge = computed(() => Boolean(props.player && props.player.isRealUser && props.userPlayer && !(playerIsUser.value) && (!playersAreAnonymous.value || isGameFinished.value)));

const onOpenPurchasePlayerBadgeRequested = () => emit('onOpenPurchasePlayerBadgeRequested', props.player._id);

</script>

<style scoped>

</style>
