<template>
  <div class="row victoryBox">
    <div class="col text-center pt-2">
      <h3 class="text-info victoryHeading">Game Complete</h3>
      <img :src="victory" alt="Victory" class="victoryImg mb-4" />
      <p class="text-info victoryWinner" v-if="!isTeamConquest"><span class="victoryEmphasis">{{ getWinnerAlias() }}</span> has conquered the galaxy!</p>
      <p class="text-info victoryWinner" v-if="isTeamConquest"><span class="victoryEmphasis">{{ getWinningTeam() }}</span> has conquered the galaxy!</p>
    </div>
  </div>

  <hr />
</template>

<script setup lang="ts">
import victory from '@/assets/general/laurel_wreath.svg'
import GameHelper from "@/services/gameHelper";
import type {Game} from "@/types/game";
import {computed} from "vue";

const props = defineProps<{
  game: Game;
}>();

const isTeamConquest = computed(() => GameHelper.isTeamConquest(props.game));

const getWinnerAlias = () => props.game.state.winner && GameHelper.getPlayerById(props.game, props.game.state.winner)?.alias;
const getWinningTeam = () => props.game.state.winningTeam && GameHelper.getTeamById(props.game, props.game.state.winningTeam)?.name;
</script>

<style scoped>
.victoryImg {
  width: 150px;
  height: 150px;
}

.victoryBox {
  border: 2px solid #EFBF04;
  margin: 4px;
  border-radius: 4px;
}

.victoryHeading {
  font-size: 28px;
}

.victoryWinner {
  font-size: 22px;
}

.victoryEmphasis {
  font-weight: bold;
}
</style>
