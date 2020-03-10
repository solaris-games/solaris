<template>
  <view-container>
    <view-title title="Game List" />

    <div v-for="game in serverGames" v-bind:key="game._id">
        <h4>{{game.settings.general.name}}</h4>
        <img :src="getServerGameImage(game.settings.general.name)">
        <p>{{game.state.playerCount}} of {{game.settings.general.playerLimit}} Players</p>

        <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-primary">Read More</router-link>
    </div>

    <hr>

    <h3>User Created Games</h3>

    <table>
        <thead>
            <tr>
                <td>Name</td>
                <td>Players</td>
                <td></td>
            </tr>
        </thead>
        <tbody>
            <tr v-for="game in userGames" v-bind:key="game._id">
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
import ViewTitle from '../components/ViewTitle'
import ViewContainer from '../components/ViewContainer'
import apiService from '../services/apiService'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle
  },
  data () {
    return {
      serverGames: [],
      userGames: []
    }
  },
  async mounted () {
    try {
      let response = await apiService.listOfficialGames()
      this.serverGames = response.data

      response = await apiService.listUserGames()
      this.userGames = response.data
    } catch (err) {
      console.error(err)
    }
  },
  methods: {
    getServerGameImage (name) {
      return '' // TODO
    }
  }
}
</script>

<style scoped>
</style>
