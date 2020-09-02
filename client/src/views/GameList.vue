<template>
  <view-container>
    <view-title title="Games" />

    <h4>Official Games</h4>

    <p>These are official games and have standard settings.</p>

    <loading-spinner :loading="isLoadingServerGames"/>

    <p v-if="!isLoadingServerGames && !serverGames.length" class="text-danger">
      There are no official games available.
    </p>

    <table v-if="!isLoadingServerGames && serverGames.length" class="table table-striped table-hover">
        <thead>
            <tr class="bg-primary">
                <td>Name</td>
                <td>Type</td>
                <td class="d-none d-md-block text-center">Players</td>
                <td></td>
            </tr>
        </thead>
        <tbody>
            <tr v-for="game in serverGames" v-bind:key="game._id">
                <td>{{game.settings.general.name}}</td>
                <td>{{game.settings.general.description}}</td>
                <td class="d-none d-md-block text-center">{{game.state.players}}/{{game.settings.general.playerLimit}}</td>
                <td>
                    <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-success float-right">View</router-link>
                </td>
            </tr>
        </tbody>
    </table>

    <div class="text-right" v-if="!isLoadingServerGames">
      <router-link to="/game/active-games" tag="button" class="btn btn-success">View My Games</router-link>
    </div>

    <hr>

    <h4>User Created Games</h4>

    <loading-spinner :loading="isLoadingUserGames"/>

    <div v-if="!isLoadingUserGames && !userGames.length">
      There are no user created games available.
    </div>

    <table v-if="!isLoadingUserGames && userGames.length" class="table table-striped table-hover">
        <thead>
            <tr class="bg-primary">
                <td>Name</td>
                <td class="d-none d-md-block text-center">Players</td>
                <td></td>
            </tr>
        </thead>
        <tbody>
            <tr v-for="game in userGames" v-bind:key="game._id">
                <td>{{game.settings.general.name}}</td>
                <td class="d-none d-md-block text-center">{{game.state.players}}/{{game.settings.general.playerLimit}}</td>
                <td>
                    <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-success float-right">View</router-link>
                </td>
            </tr>
        </tbody>
    </table>

    <div class="text-right" v-if="!isLoadingUserGames">
      <router-link to="/game/active-games" tag="button" class="btn btn-success">View My Games</router-link>
    </div>
  </view-container>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner'
import ViewTitle from '../components/ViewTitle'
import ViewContainer from '../components/ViewContainer'
import gameService from '../services/api/game'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer,
    'view-title': ViewTitle
  },
  data () {
    return {
      serverGames: [],
      userGames: [],
      isLoadingServerGames: true,
      isLoadingUserGames: true
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

    this.isLoadingServerGames = false
    this.isLoadingUserGames = false
  }
}
</script>

<style scoped>
</style>
