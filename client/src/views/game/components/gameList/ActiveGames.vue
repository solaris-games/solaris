<template>
  <div>
    <div class="row">
      <div class="col">
        <h4>Active Games</h4>
      </div>
      <div class="col-auto">
        <input class="form-check-input me-1" type="checkbox" v-model="includeDefeated" id="chkIncludeDefeated">
        <label class="form-check-label" for="chkIncludeDefeated">
          Show Defeated/AFK
        </label>
      </div>
    </div>

    <loading-spinner :loading="isLoadingActiveGames"/>

    <div v-if="!isLoadingActiveGames && !filteredActiveGames.length">
        <p>You are not in any active games.</p>
    </div>

    <div class="table-responsive">
      <table v-if="!isLoadingActiveGames && filteredActiveGames.length" class="table table-striped table-hover">
          <thead class="table-dark">
              <tr>
                  <td class="col-9 col-md-6">Name</td>
                  <td class="col-3 d-none d-md-table-cell">Cycle/Turn</td>
                  <td class="col-1 col-md-6 text-center">Players</td>
                  <td class="col-auto"></td>
              </tr>
          </thead>
          <tbody>
              <tr v-for="game in filteredActiveGames" v-bind:key="game._id">
                  <td class="col-6">
                    <router-link :to="{ path: '/game/detail', query: { id: game._id } }" class="me-1">{{game.settings.general.name}}</router-link>
                    <br/>
                    <small>{{getGameTypeFriendlyText(game)}}</small>
                    <br/>
                    <span v-if="game.userNotifications.defeated && !game.userNotifications.afk" class="me-1 badge bg-danger">Defeated</span>
                    <span v-if="!game.userNotifications.defeated && game.userNotifications.turnWaiting" class="me-1 badge bg-danger">Turn Waiting</span>
                    <span v-if="!game.userNotifications.defeated && game.userNotifications.unreadEvents" class="me-1 badge bg-warning">{{game.userNotifications.unreadEvents}} Events</span>
                    <span v-if="game.userNotifications.afk" class="me-1 badge bg-warning">AFK</span>
                    <span v-if="game.userNotifications.unreadConversations" class="me-1 badge bg-info">{{game.userNotifications.unreadConversations}} Messages</span>

                    <div class="d-md-none text-info">
                      <small>
                        <span v-if="isGameWaitingForPlayers(game)">
                          Waiting for Players
                        </span>
                        <span v-if="isGamePendingStart(game)">
                          Starting Soon
                        </span>
                        <span v-if="isGameInProgress(game)">
                          <countdown-timer :endDate="getNextCycleDate(game)" :active="true" afterEndText="Pending..."></countdown-timer>
                        </span>
                      </small>
                    </div>
                  </td>
                  <td class="col-3 d-none d-md-table-cell">
                    <span v-if="isGameWaitingForPlayers(game)">
                      Waiting for Players
                    </span>
                    <span v-if="isGamePendingStart(game)">
                      Starting Soon
                    </span>
                    <span v-if="isGameInProgress(game)">
                      <countdown-timer :endDate="getNextCycleDate(game)" :active="true" afterEndText="Pending..."></countdown-timer>
                    </span>
                  </td>
                  <td class="col-1 col-md-6 text-center">{{game.state.players}}/{{game.settings.general.playerLimit}}</td>
                  <td class="col-auto">
                    <div class="btn-group">
                      <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-primary">View</router-link>
                      <router-link :to="{ path: '/game', query: { id: game._id } }" tag="button" class="btn btn-success">
                        Play
                      </router-link>
                    </div>
                  </td>
              </tr>
          </tbody>
      </table>
    </div>

    <div class="text-end" v-if="!isLoadingActiveGames">
      <router-link to="/game/create" tag="button" class="btn btn-info me-1"><i class="fas fa-gamepad"></i> Create Game</router-link>
      <router-link to="/game/list" tag="button" class="btn btn-success">Join New  Game <i class="fas fa-arrow-right"></i></router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import GameHelper from '../../../../services/gameHelper';
import CountdownTimer from '../CountdownTimer.vue';
import { loadLocalPreference, storeLocalPreference } from '@/util/localPreference';
import type { UserActiveListGame } from '@solaris-common';
import { ref, computed, type Ref, inject, onMounted, watch } from 'vue';
import { listActive } from '@/services/typedapi/game';
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi';

const INCLUDE_DEFEATED_PREF_KEY = 'activeGamesIncludeDefeated';

const httpClient = inject(httpInjectionKey)!;

const activeGames: Ref<UserActiveListGame<string>[]> = ref([]);
const isLoadingActiveGames = ref(false);
const includeDefeated = ref(loadLocalPreference(INCLUDE_DEFEATED_PREF_KEY, true));

watch(includeDefeated, (newValue) => storeLocalPreference(INCLUDE_DEFEATED_PREF_KEY, newValue));

const filteredActiveGames = computed(() => {
  if (includeDefeated.value) {
    return activeGames.value;
  }

  return activeGames.value.filter(g => !g.userNotifications.defeated);
});

const isRealTimeGame = (game: UserActiveListGame<string>) => GameHelper.isRealTimeGame(game);

const isGameWaitingForPlayers = (game: UserActiveListGame<string>) => GameHelper.isGameWaitingForPlayers(game);

const isGamePendingStart = (game: UserActiveListGame<string>) => GameHelper.isGamePendingStart(game);

const isGameInProgress = (game: UserActiveListGame<string>) => GameHelper.isGameInProgress(game);

const getNextCycleDate = (game: UserActiveListGame<string>) => {
  if (GameHelper.isRealTimeGame(game)) {
    return GameHelper.getCountdownTimeForProductionCycle(game);
  } else if (GameHelper.isTurnBasedGame(game)) {
    return GameHelper.getCountdownTimeForTurnTimeout(game);
  }
};

const getGameTypeFriendlyText = (game: UserActiveListGame<string>) => GameHelper.getGameTypeFriendlyText(game);

const loadActiveGames = async () => {
  isLoadingActiveGames.value = true;

  const response = await listActive(httpClient)();

  if (isOk(response)) {
    activeGames.value = response.data.sort((a, b) => (Number(a.userNotifications.defeated) - Number(a.userNotifications.afk)) - (Number(b.userNotifications.defeated)  - Number(b.userNotifications.afk)));
  } else {
    console.error(formatError(response));
  }

  isLoadingActiveGames.value = false;
};

onMounted(async () => {
  await loadActiveGames();
});
</script>

<style scoped>
</style>
