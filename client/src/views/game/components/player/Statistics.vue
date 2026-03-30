<template>
<div class="table-responsive mb-0" v-if="player">
  <table class="table table-sm  mb-1">
      <thead class="table-dark">
          <tr>
              <th></th>
              <th v-if="!isUserPlayer"></th>
              <th v-if="userIsInGame" class="text-end">You</th>
          </tr>
      </thead>
      <tbody>
          <statistic-row :playerId="playerId"
                         header="Stars"
                         scanningRangeTooltip="This figure is based on the stars in your scanning range."
                         :playerStat="player.stats!.totalStars"
                         :userPlayerStat="userPlayer?.stats?.totalStars">
          </statistic-row>
          <statistic-row v-if="isConquestHomeStars"
                         :playerId="playerId"
                         header="Capitals"
                         scanningRangeTooltip="This figure is based on the capitals in your scanning range."
                         :playerStat="player.stats!.totalHomeStars"
                         :userPlayerStat="userPlayer?.stats?.totalHomeStars">
          </statistic-row>
          <statistic-row :playerId="playerId"
                         header="Carriers"
                         scanningRangeTooltip="This figure is based on the carriers in your scanning range."
                         :playerStat="player.stats!.totalCarriers"
                         :userPlayerStat="userPlayer?.stats?.totalCarriers">
          </statistic-row>
          <statistic-row  v-if="isSpecialistsEnabled"
                         :playerId="playerId"
                         header="Specialists"
                         scanningRangeTooltip="This figure is based on the specialists in your scanning range."
                         :playerStat="player.stats!.totalSpecialists"
                         :userPlayerStat="userPlayer?.stats?.totalSpecialists">
          </statistic-row>
          <statistic-row :playerId="playerId"
                         header="Ships"
                         scanningRangeTooltip="This figure is based on the ships in your scanning range."
                         :playerStat="player.stats!.totalShips"
                         :userPlayerStat="userPlayer?.stats?.totalShips"
                         :formatFunction="formatTotalShipsValue">
          </statistic-row>
          <statistic-row :playerId="playerId"
                         header="New Ships"
                         scanningRangeTooltip="This figure is based on the stars in your scanning range."
                         :playerStat="player.stats!.newShips"
                         :userPlayerStat="userPlayer?.stats?.newShips">
          </statistic-row>
          <statistic-row :playerId="playerId"
                         header="Cycle Income"
                         scanningRangeTooltip="This figure is based on the stars in your scanning range."
                         :playerStat="playerIncome"
                         :userPlayerStat="userPlayerIncome"
                         :formatFunction="formatCreditsValue">
          </statistic-row>
          <statistic-row v-if="playerTickIncome > 0 || userPlayerTickIncome > 0"
                         :playerId="playerId"
                         header="Tick Income"
                         scanningRangeTooltip="This figure is based on the Financial Analysts in your scanning range."
                         :playerStat="playerTickIncome"
                         :userPlayerStat="userPlayerTickIncome"
                         :formatFunction="formatCreditsValue"
                         :isPlayerStatAlwaysUncertain="true">
          </statistic-row>
      </tbody>
  </table>

  <p class="text-warning text-center mb-2" v-if="isDarkModeExtra && userIsInGame && isUserPlayer"><small>Based on your scanning range.</small></p>
</div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { computed } from 'vue';
import GameHelper from '../../../../services/gameHelper'
import StatisticRow from './StatisticRow.vue'
import type {Player} from "@/types/game.ts";

const props = defineProps<{
  playerId: string,
}>();

const store = useGameStore();
const game = computed(() => store.game!);
const player = computed(() => GameHelper.getPlayerById(game.value, props.playerId)!);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const isUserPlayer = computed(() => userPlayer.value && player.value._id === userPlayer.value._id);
const userIsInGame = computed(() => Boolean(userPlayer.value));
const isSpecialistsEnabled = computed(() => GameHelper.isSpecialistsEnabled(game.value));
const isDarkModeExtra = computed(() => GameHelper.isDarkModeExtra(game.value));
const isConquestHomeStars = computed(() => GameHelper.isConquestHomeStars(game.value));
const playerIncome = computed(() => GameHelper.calculateIncome(game.value, player.value));
const userPlayerIncome = computed(() => GameHelper.calculateIncome(game.value, userPlayer.value));
const playerTickIncome = computed(() => GameHelper.calculateTickIncome(game.value, player.value));
const userPlayerTickIncome = computed(() => GameHelper.calculateTickIncome(game.value, userPlayer.value));

const formatCreditsValue = (player: Player, value: number) => `$${value}`;

const formatTotalShipsValue = (player: Player, value: number) => {
  if (player.stats!.totalShipsMax != null) {
    return `${value}/${player.stats!.totalShipsMax}`
  }

  return value.toString();
};
</script>

<style scoped>
.table-sm th {
  padding: 0;
}
</style>
