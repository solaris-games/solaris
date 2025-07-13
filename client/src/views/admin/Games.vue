<template>
  <administration-page title="Recent games" name="games">
    <loading-spinner :loading="!games"/>

    <div v-if="games">
      <table class="mt-2 table table-sm table-striped table-responsive">
        <thead class="table-dark">
        <tr>
          <th>Name</th>
          <th>Players</th>
          <th>Settings</th>
          <th>Started</th>
          <th>Ended</th>
          <th>Tick</th>
          <th></th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="game of games" :key="game._id">
          <td>
            {{ game.settings.general.name }}
            <br/>
            <small>{{ game.settings.general.type }}</small>
          </td>
          <td>
            {{ game.state.players }}/{{ game.settings.general.playerLimit }}
          </td>
          <td>
            <i class="clickable fas"
               :class="{'fa-star text-success':game.settings.general.featured,'fa-star text-danger':!game.settings.general.featured}"
               @click="toggleFeaturedGame(game)" title="Featured"></i>
            <i class="clickable ms-1 fas"
               :class="{'fa-clock text-success':game.settings.general.timeMachine === 'enabled','fa-clock text-danger':game.settings.general.timeMachine === 'disabled'}"
               @click="toggleTimeMachineGame(game)" v-if="isGameMaster" title="Time Machine"></i>
          </td>
          <td><i class="fas"
                 :class="{'fa-check text-success':game.state.startDate,'fa-times text-danger':!game.state.startDate}"
                 :title="game.state.startDate?.toString()"></i></td>
          <td>
            <i class="clickable fas"
               :class="{'fa-check text-success':game.state.endDate,'fa-times text-danger':!game.state.endDate}"
               :title="game.state.endDate?.toString()"
               @click="forceGameFinish(game)"></i>
          </td>
          <td :class="{'text-warning':gameNeedsAttention(game)}">{{ game.state.tick }}</td>
          <td>
            <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button"
                         class="btn btn-outline-success btn-sm">View
            </router-link>
          </td>
          <td>
            <button v-if="isAdministrator" class="btn btn-outline-warning btn-sm" @click="resetQuitters(game)">Reset
              quitters
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </administration-page>
</template>

<script setup lang="ts">
import LoadingSpinner from "../components/LoadingSpinner.vue";
import AdministrationPage from "./AdministrationPage.vue";
import { ref, inject, onMounted, computed, type Ref } from 'vue';
import type { ListGame } from '@solaris-common';
import { httpInjectionKey, isOk, isError, formatError } from '@/services/typedapi';
import { listGames, resetQuitters as requestResetQuitters, setGameFeatured, finishGame, setGameTimeMachine } from '@/services/typedapi/admin';
import { toastInjectionKey } from '@/util/keys';
import { useStore, type Store } from 'vuex';
import type { State } from '@/store';
import { makeConfirm } from "@/util/confirm";

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store: Store<State> = useStore();
const confirm = makeConfirm(store);

const games: Ref<ListGame<string>[] | null> = ref(null);

const isAdministrator = computed(() => store.state.roles.administrator);
const isCommunityManager = computed(() => isAdministrator.value || store.state.roles.communityManager);
const isGameMaster = computed(() => isAdministrator.value || store.state.roles.gameMaster);

const gameNeedsAttention = (game: ListGame<string>) => game.state.endDate && game.state.tick <= 12;

const resetQuitters = async (game: ListGame<string>) => {
  const response = await requestResetQuitters(httpClient)(game._id);

  if (isError(response)) {
    console.error(formatError(response));
  }
};

const toggleFeaturedGame = async (game: ListGame<string>) => {
  const newState = !game.settings.general.featured;
  const response = await setGameFeatured(httpClient)(game._id, newState);

  if (isError(response)) {
    console.error(formatError(response));
  } else {
    game.settings.general.featured = newState;
  }
};

const forceGameFinish = async (game: ListGame<string>) => {
  if (!isAdministrator.value || !game.state.startDate || game.state.endDate) {
    return;
  }

  if (await confirm('Force Game Finish', 'Are you sure you want to force this game to finish?')) {
    const response = await finishGame(httpClient)(game._id);

    if (isError(response)) {
      console.error(formatError(response));
      toast.error('Error forcing finish');
    } else {
      game.state.endDate = new Date();
    }
  }
};

const toggleTimeMachineGame = async (game: ListGame<string>) => {
  let newState;

  if (game.settings.general.timeMachine === 'enabled') {
    newState = 'disabled'
  } else {
    newState = 'enabled'
  }

  const response = await setGameTimeMachine(httpClient)(game._id, newState);

  if (isError(response)) {
    console.error(formatError(response));
    toast.error('Error toggling Time Machine');
  } else {
    game.settings.general.timeMachine = newState;
  }
};

const updateGames = async () => {
  const response = await listGames(httpClient)();

  if (isOk(response)) {
    games.value = response.data;
  } else {
    console.error(formatError(response));
    toast.error('Error loading games');
  }
};

onMounted(async () => {
  await updateGames();
});
</script>

<style scoped>

</style>
