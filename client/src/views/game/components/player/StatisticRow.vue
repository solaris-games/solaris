<template>
    <tr>
      <td>{{header}}</td>
      <td class="text-end" :title="isPlayerStatUncertain ? scanningRangeTooltip : undefined">{{formatValue(player, playerStat)}}{{ isPlayerStatUncertain ? '?' : ''}}</td>
      <td class="text-end" v-if="userIsInGame && !isUserPlayer && userPlayerStat && userPlayer"
        :class="{'text-danger': playerStat > userPlayerStat,
                  'text-success': playerStat < userPlayerStat}">{{formatValue(userPlayer, userPlayerStat)}}</td>
    </tr>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { computed } from 'vue';
import GameHelper from '../../../../services/gameHelper'
import type {Player} from "@/types/game";

const props = defineProps<{
  playerId: string,
  header: string,
  scanningRangeTooltip: string,
  isPlayerStatAlwaysUncertain?: boolean,
  playerStat: number,
  userPlayerStat?: number,
  formatFunction?: (p: Player, n: number) => string,
}>();

const store = useGameStore();
const game = computed(() => store.game!);
const player = computed(() => GameHelper.getPlayerById(game.value, props.playerId)!);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const userIsInGame = computed(() => Boolean(userPlayer.value));
const isUserPlayer = computed(() => userPlayer.value && props.playerId === userPlayer.value._id);
const isDarkModeExtra = computed(() => GameHelper.isDarkModeExtra(game.value));
const hasPerspective = computed(() => {
  if (userIsInGame.value) {
    return false;
  }

  return player.value.hasPerspective || false;
})

const formatValue = (player: Player, value: number) => {
  if (props.formatFunction) {
    return props.formatFunction(player, value);
  }

  return value;
}

const isPlayerStatUncertain = computed(() => {
  // The stat is uncertain if all of the following are true:
  // * the game is unfinished
  // * the user does not have perspective of the other player (ie they're not spectating them)
  //     - (hasPerspective will be false if the user is a player in the game even if the other player has added them as a spectator.)
  // * the stat is marked to always be uncertain, or we're in extra dark
  // * the user is not the player.
  return !GameHelper.isGameFinished(game.value)
    && !hasPerspective.value
    && (props.isPlayerStatAlwaysUncertain || isDarkModeExtra.value)
    && !isUserPlayer.value;
});
</script>

<style scoped>
  td {
    padding: 0;
  }
</style>
