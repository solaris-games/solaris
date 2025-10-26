<template>
  <view-container :is-auth-page="true">
    <view-title title="Game Settings" navigation="main-menu"/>

    <loading-spinner :loading="isLoading"/>

    <div v-if="!isLoading && game">
      <view-subtitle :title="game.settings.general.name" class="mt-2"/>

      <p class="description" v-if="game.settings.general.description">{{game.settings.general.description}}</p>

      <p v-if="isNewPlayerGame" class="text-warning">New Player Games do not affect Rank or Victories.</p>
      <p v-if="isCustomFeaturedGame" class="text-warning">This is a featured game and will award rank points.</p>

      <p v-for="error of errors" class="text-danger">{{error}}</p>

      <div class="row mb-1 bg-dark pt-2 pb-2">
        <div class="col">
          <router-link to="/game/list" tag="button" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Return to List</router-link>
        </div>
        <div class="col-auto">
          <router-link :to="{ path: '/game', query: { id: game._id } }" tag="button" class="btn btn-success ms-1">Open Game <i class="fas fa-arrow-right"></i></router-link>
        </div>
      </div>

      <game-control :game="game" @onGameModified="loadGame" />

      <div class="row mb-2" v-if="game.settings.general.type === 'new_player_rt' || game.settings.general.type === 'new_player_tb' || game.settings.general.type === 'tutorial'">
        <div class="ratio ratio-16x9">
          <iframe src="https://www.youtube.com/embed/cnRXQMQ43Gs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>

      <game-settings :game="game"/>
    </div>
  </view-container>
</template>

<script setup lang="ts">
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ViewTitle from '../components/ViewTitle.vue'
import ViewSubtitle from '../components/ViewSubtitle.vue'
import ViewContainer from '../components/ViewContainer.vue'
import GameSettings from './components/settings/GameSettings.vue'
import GameControl from './GameControl.vue'
import GameHelper from '../../services/gameHelper'
import { ref, inject, computed, type Ref, onMounted } from 'vue';
import type { GameInfoDetail } from '@solaris-common'
import { useRoute } from 'vue-router'
import { extractErrors, formatError, httpInjectionKey, isOk } from '@/services/typedapi'
import { detailInfo } from '@/services/typedapi/game'

const httpClient = inject(httpInjectionKey)!;

const isLoading = ref(false);
const errors: Ref<string[]> = ref([]);
const game: Ref<GameInfoDetail<string> | null> = ref(null);

const gameId = useRoute().query.id?.toString();

const isNewPlayerGame = computed(() => GameHelper.isNewPlayerGame(game.value));
const isCustomFeaturedGame = computed(() => GameHelper.isCustomGame(game.value) && GameHelper.isFeaturedGame(game.value));

const loadGame = async () => {
  if (!gameId) {
    return;
  }

  isLoading.value = true;

  const response = await detailInfo(httpClient)(gameId);

  if (isOk(response)) {
    game.value = response.data;
  } else {
    errors.value = extractErrors(response);
    console.error(formatError(response));
  }

  isLoading.value = false;
};

onMounted(async () => {
  await loadGame();
});
</script>

<style scoped>
.description {
  white-space: pre-wrap;
}
</style>
