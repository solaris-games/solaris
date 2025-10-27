<template>
  <div>
    <h4>Completed Games</h4>

    <loading-spinner :loading="isLoading"/>

    <div v-if="!isLoading && !completedGames.length">
      <p>You have not completed any games yet.</p>
    </div>

    <table v-if="!isLoading && completedGames.length" class="table table-striped table-hover">
        <thead class="table-dark">
            <tr>
                <td>Name</td>
                <td class="d-none d-sm-table-cell text-end">Completed</td>
                <td></td>
            </tr>
        </thead>
        <tbody>
            <tr v-for="game in completedGames" v-bind:key="game._id">
                <td>
                  <span v-if="game.userNotifications.position === 1" class="me-1"><i class="fas fa-medal gold"></i></span>
                  <span v-if="game.userNotifications.position === 2" class="me-1"><i class="fas fa-medal silver"></i></span>
                  <span v-if="game.userNotifications.position === 3" class="me-1"><i class="fas fa-medal bronze"></i></span>
                  <span v-if="GameHelper.isTeamConquest(game)" class="me-1"><i class="fas fa-users"></i></span>
                  <router-link :to="{ path: '/game/detail', query: { id: game._id } }" class="me-1">{{game.settings.general.name}}</router-link>
                  <br/>
                  <small>{{GameHelper.getGameTypeFriendlyText(game)}}</small>
                  <br/>
                  <span v-if="game.userNotifications.unreadConversations" class="me-1 badge bg-info">{{game.userNotifications.unreadConversations}} Messages</span>
                </td>
                <td class="d-none d-sm-table-cell text-end">{{getEndDateFromNow(game)}}</td>
                <td>
                    <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-outline-success float-end">View</router-link>
                </td>
            </tr>
        </tbody>
    </table>

    <div class="text-end" v-if="!isLoading">
      <router-link to="/game/create" tag="button" class="btn btn-info me-1"><i class="fas fa-gamepad"></i> Create Game</router-link>
      <router-link to="/game/list" tag="button" class="btn btn-success">Join New  Game <i class="fas fa-arrow-right"></i></router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import GameHelper from '../../../../services/gameHelper';
import moment from 'moment';
import { ref, inject, type Ref, onMounted } from 'vue';
import type { ListGame, UserActiveListGame } from '@solaris-common';
import { listMyCompleted } from '@/services/typedapi/game';
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi';

const httpClient = inject(httpInjectionKey)!;

const isLoading = ref(false);
const completedGames: Ref<UserActiveListGame<string>[]> = ref([]);

const getEndDateFromNow = (game: ListGame<string>) => moment(game.state.endDate).fromNow();

onMounted(async () => {
  isLoading.value = true;

  const response = await listMyCompleted(httpClient)();
  if (isOk(response)) {
    completedGames.value = response.data;
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
});
</script>

<style scoped>
.gold {
  color: gold;
}

.silver {
  color: silver;
}

.bronze {
  color: #b08d57;
}
</style>
