<template>
  <view-container>
    <view-title title="Active Games" />

    <div v-if="!games.length">
        <p>You are not in any active games.</p>

        <router-link to="/game/list" tag="button" class="btn btn-success">Join Game</router-link>
    </div>

    <table>
        <thead>
            <tr>
                <td>Name</td>
                <td>Players</td>
                <td></td>
            </tr>
        </thead>
        <tbody>
            <tr v-for="game in games" v-bind:key="game._id">
                <td>{{game.settings.general.name}}</td>
                <td>{{game.state.playerCount}} of {{game.settings.general.playerLimit}}</td>
                <td>
                    <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-primary">Read More</router-link>
                </td>
            </tr>
        </tbody>
    </table>
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
      games: []
    }
  },
  async mounted () {
    try {
      let response = await apiService.listActiveGames()

      this.games = response.data
    } catch (err) {
      console.error(err)
    }
  }
}
</script>

<style scoped>
</style>
