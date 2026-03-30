<template>
  <div class="row">
    <div class="table-responsive p-0">
      <table class="table table-sm table-striped">
        <tbody>
          <leaderboard-row v-for="player in sortedPlayers" :key="player._id" :player="player" :show-team-names="true" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested" />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import GameHelper from '../../../../services/gameHelper'
import LeaderboardRow from './LeaderboardRow.vue';
import type {Game} from "@/types/game";

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const onOpenPlayerDetailRequested = (e: string) => emit('onOpenPlayerDetailRequested', e);

const store = useStore();
const game = computed<Game>(() => store.game);
const sortedPlayers = computed(() => GameHelper.getSortedLeaderboardPlayerList(game.value));
</script>

<style scoped>
table tr {
  height: 59px;
}

.table-sm td {
  padding: 0;
}

@media screen and (max-width: 576px) {
  table tr {
    height: 45px;
  }
}
</style>
