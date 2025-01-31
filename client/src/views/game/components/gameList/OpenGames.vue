<template>
  <LoadingSpinner :loading="isLoading"/>

  <div v-if="games?.length">
    <h4>Open Games</h4>
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
import { type Ref, ref, onMounted } from 'vue';
import LoadingSpinner from "../../../components/LoadingSpinner.vue";
import type { Game } from "../../../../types/game";
import GameHelper from "client/src/services/gameHelper";
import gameService from '../../../../services/api/game'

const isLoading = ref(true);

const games: Ref<Game[]> = ref([]);

onMounted(async () => {
  try {
    let response = await gameService.listOpenGames()

    games.value = response.data;
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false;
  }
})

</script>

<style scoped>
</style>
