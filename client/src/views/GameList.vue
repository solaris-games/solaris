<template>
  <view-container>
    <view-title title="Games" />

    <h4>Official Games</h4>

    <p>These are official games and have standard settings.</p>

    <p v-if="!serverGames.length" class="text-danger">
      There are no official games available.
    </p>

    <table v-if="serverGames.length" class="table table-striped table-hover">
        <thead>
            <tr class="bg-primary">
                <td>Name</td>
                <td>Players</td>
                <td></td>
            </tr>
        </thead>
        <tbody>
            <tr v-for="game in serverGames" v-bind:key="game._id">
                <td>{{game.settings.general.name}}</td>
                <td>{{game.settings.general.playerLimit}}</td> <!-- TODO: Would be nice to have current players in the game -->
                <td>
                    <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-primary float-right">Read More</router-link>
                </td>
            </tr>
        </tbody>
    </table>

    <hr>

    <h4>User Created Games</h4>

    <div v-if="!userGames.length">
      There are no user created games available.
    </div>

    <table v-if="userGames.length" class="table table-striped table-hover">
        <thead>
            <tr class="bg-primary">
                <td>Name</td>
                <td>Players</td>
                <td></td>
            </tr>
        </thead>
        <tbody>
            <tr v-for="game in userGames" v-bind:key="game._id">
                <td>{{game.settings.general.name}}</td>
                <td>{{game.settings.general.playerLimit}}</td> <!-- TODO: Would be nice to have current players in the game -->
                <td>
                    <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-primary float-right">Read More</router-link>
                </td>
            </tr>
        </tbody>
    </table>
  </view-container>
</template>

<script>
import ViewTitle from '../components/ViewTitle'
import ViewContainer from '../components/ViewContainer'
import gameService from '../services/api/game'

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
      let responseOfficial = await gameService.listOfficialGames()
      this.serverGames = responseOfficial.data

      let responseUser = await gameService.listUserGames()
      this.userGames = responseUser.data
    } catch (err) {
      console.error(err)
    }
  }
}
</script>

<style scoped>
</style>
