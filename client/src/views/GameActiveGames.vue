<template>
  <view-container>
    <view-title title="My Games" />

    <h4>Active Games</h4>

    <loading-spinner :loading="isLoadingActiveGames"/>
    
    <div v-if="!isLoadingActiveGames && !activeGames.length">
        <p>You are not in any active games.</p>

        <router-link to="/game/list" tag="button" class="btn btn-success">Join Game</router-link>
    </div>

    <router-link
      v-for="game in activeGames" v-bind:key="game._id"
      :to="{ path: '/game', query: { id: game._id } }"
      tag="button"
      class="btn btn-block btn-primary mb-2">{{game.settings.general.name}}</router-link>

    <hr>

    <h4>Completed Games</h4>

    <loading-spinner :loading="isLoadingCompletedGames"/>
    
    <div v-if="!isLoadingActiveGames && !activeGames.length">
        <p>You have not completed any games yet.</p>

        <router-link to="/game/list" tag="button" class="btn btn-success">Join Game</router-link>
    </div>
    
    <router-link
      v-for="game in completedGames" v-bind:key="game._id"
      :to="{ path: '/game', query: { id: game._id } }"
      tag="button"
      class="btn btn-block btn-primary mb-2">{{game.settings.general.name}}</router-link>

  </view-container>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner'
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import gameService from '../services/api/game'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer,
    'view-title': ViewTitle
  },
  data () {
    return {
      activeGames: [],
      completedGames: [],
      isLoadingActiveGames: true,
      isLoadingCompletedGames: true
    }
  },
  async mounted () {
    try {
      let response = await gameService.listActiveGames()

      this.activeGames = response.data
      this.isLoadingActiveGames = false

      response = await gameService.listCompletedGames()

      this.completedGames = response.data
      this.isLoadingCompletedGames = false
    } catch (err) {
      console.error(err)
    }
  }
}
</script>

<style scoped>
</style>
