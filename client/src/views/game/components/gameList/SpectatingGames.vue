<template>
  <div v-if="games.length">
    <h4>Spectating</h4>

    <table class="table table-striped table-hover">
      <thead class="table-dark">
        <tr>
          <td>Name</td>
          <td>Cycle/Turn</td>
          <td class="d-none d-sm-table-cell text-end">Players</td>
          <td></td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="game in games" v-bind:key="game._id">
          <td>
            <router-link :to="{ path: '/game/detail', query: { id: game._id } }"
              class="me-1">{{ game.settings.general.name }}</router-link>
            <br />
            <small>{{ GameHelper.getGameTypeFriendlyText(game) }}</small>
          </td>
          <td class="col-3 d-none d-md-table-cell">
            <span v-if="GameHelper.isGameWaitingForPlayers(game)">
              Waiting for Players
            </span>
            <span v-if="GameHelper.isGamePendingStart(game)">
              Starting Soon
            </span>
            <span v-if="GameHelper.isGameInProgress(game)">
              <countdown-timer :endDate="getNextCycleDate(game)" :active="true"
                afterEndText="Pending..."></countdown-timer>
            </span>
          </td>
          <td class="d-none d-sm-table-cell text-end">{{ game.state.players }}/{{ game.settings.general.playerLimit }}</td>
          <td>
            <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button"
              class="btn btn-outline-success float-end">View</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import GameHelper from '../../../../services/gameHelper'
import CountdownTimer from '../CountdownTimer.vue';
import { type Ref, ref, onMounted, inject } from 'vue';
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi';
import { listSpectating } from '@/services/typedapi/game';
import type { ListGame } from '@solaris-common';

const httpClient = inject(httpInjectionKey)!;

const games: Ref<ListGame<string>[]> = ref([]);

const getNextCycleDate = (game: ListGame<string>) => {
  if (GameHelper.isRealTimeGame(game)) {
    return GameHelper.getCountdownTimeForProductionCycle(game)
  } else if (GameHelper.isTurnBasedGame(game)) {
    return GameHelper.getCountdownTimeForTurnTimeout(game)
  }
};

onMounted(async () => {
  const response = await listSpectating(httpClient)();

  if (isOk(response)) {
    games.value = response.data;
  } else {
    console.error(formatError(response));
  }
});
</script>

<style scoped></style>
