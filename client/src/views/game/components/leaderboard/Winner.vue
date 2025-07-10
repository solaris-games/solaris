<template>
  <div class="row">
    <div class="col text-center pt-2">


      <h3>Game Over</h3>
      <p v-if="!isTeamConquest">The winner is <b>{{ getWinnerAlias() }}</b>!</p>
      <p v-if="isTeamConquest">The winning team is <b>{{ getWinningTeam() }}</b></p>
    </div>
  </div>
</template>

<script setup lang="ts">
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

</style>
