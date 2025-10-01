<template>
  <LoadingSpinner :loading="isLoading"/>

  <div v-if="games?.length">
    <h4>
      Open Games

      <HelpTooltip tooltip="Games that you have created, but not joined yet, and are still waiting to start."/>
    </h4>
    <table class="table table-striped table-hover">
      <thead class="table-dark">
      <tr>
        <td>Name</td>
        <td class="d-none d-sm-table-cell text-end">Players</td>
        <td></td>
      </tr>
      </thead>
      <tbody>
      <tr v-for="game in games" v-bind:key="game._id">
        <td>
          <router-link :to="{ path: '/game/detail', query: { id: game._id } }" class="me-1">{{game.settings.general.name}}</router-link>
          <br/>
          <small>{{GameHelper.getGameTypeFriendlyText(game)}}</small>
        </td>
        <td class="d-none d-sm-table-cell text-end">{{game.state.players}}/{{game.settings.general.playerLimit}}</td>
        <td>
          <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-outline-success float-end">View</router-link>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { type Ref, ref, onMounted, inject } from 'vue';
import LoadingSpinner from "../../../components/LoadingSpinner.vue";
import GameHelper from "../../../../services/gameHelper";
import HelpTooltip from "../../../components/HelpTooltip.vue";
import { listMyOpen } from '@/services/typedapi/game';
import { httpInjectionKey, isOk } from '@/services/typedapi';
import type { ListGame } from '@solaris-common';

const httpClient = inject(httpInjectionKey)!;

const isLoading = ref(false);

const games: Ref<ListGame<string>[]> = ref([]);

onMounted(async () => {
  isLoading.value = true;

  const response = await listMyOpen(httpClient)();
  if (isOk(response)) {
    games.value = response.data;
  }

  isLoading.value = false;
});
</script>

<style scoped>
</style>
