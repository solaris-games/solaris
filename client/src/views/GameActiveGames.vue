<template>
  <view-container>
    <view-title title="Active Games" />

    <div v-if="!activeGames.length">
        <p>You are not in any active games.</p>

        <router-link to="/game/list" tag="button" class="btn btn-success">Join Game</router-link>
    </div>

    <router-link 
      v-for="game in activeGames" v-bind:key="game._id"
      :to="{ path: '/game/detail', query: { id: game._id } }" 
      tag="button" 
      class="btn btn-block btn-primary mb-2">{{game.settings.general.name}}</router-link>

    <div v-if="completedGames.length">
      <hr>

      <h4>Completed Games</h4>

      <router-link 
        v-for="game in completedGames" v-bind:key="game._id"
        :to="{ path: '/game/detail', query: { id: game._id } }" 
        tag="button" 
        class="btn btn-block btn-primary mb-2">{{game.settings.general.name}}</router-link>
    </div>

  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'

import apiService from '../services/apiService'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle
  },
  data () {
    return {
      activeGames: [],
      completedGames: []
    }
  },
  async mounted () {
    try {
      let response = await apiService.listActiveGames()

      this.activeGames = response.data

      response = await apiService.listCompletedGames()

      this.completedGames = response.data
    } catch (err) {
      console.error(err)
    }
  }
}
</script>

<style scoped>
</style>
