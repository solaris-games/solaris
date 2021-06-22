<template>
  <view-container>
    <view-title title="My Games" />

    <h4>Active Games</h4>

    <loading-spinner :loading="isLoadingActiveGames"/>

    <div v-if="!isLoadingActiveGames && !activeGames.length">
        <p>You are not in any active games.</p>
    </div>

    <div class="table-responsive">
      <table v-if="!isLoadingActiveGames && activeGames.length" class="table table-striped table-hover">
          <thead>
              <tr class="bg-primary">
                  <td class="col">Name</td>
                  <td class="col text-center">Players</td>
                  <td class="col d-none d-md-table-cell">Status</td>
                  <td class="col-auto"></td>
              </tr>
          </thead>
          <tbody>
              <tr v-for="game in activeGames" v-bind:key="game._id">
                  <td class="col">{{game.settings.general.name}}</td>
                  <td class="col text-center">{{game.state.players}}/{{game.settings.general.playerLimit}}</td>
                  <td class="col d-none d-md-table-cell">{{getGameStatusText(game)}}</td>
                  <td class="col-auto">
                      <div class="btn-group">
                          <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-primary">View</router-link>
                          <router-link :to="{ path: '/game', query: { id: game._id } }" tag="button" class="btn btn-success">
                            Play
                          </router-link>
                      </div>
                      <span v-if="game.unread" class="ml-2 badge badge-warning">{{game.unread}}</span>
                      <span v-if="game.turnWaiting" class="ml-1 badge badge-info">Turn Waiting</span>
                  </td>
              </tr>
          </tbody>
      </table>
    </div>

    <div class="text-right" v-if="!isLoadingActiveGames">
      <router-link to="/game/create" tag="button" class="btn btn-info mr-1">Create Game</router-link>
      <router-link to="/game/list" tag="button" class="btn btn-success">Join New  Game</router-link>
    </div>

    <hr>

    <h4>Completed Games</h4>

    <loading-spinner :loading="isLoadingCompletedGames"/>

    <div v-if="!isLoadingCompletedGames && !completedGames.length">
      <p>You have not completed any games yet.</p>
    </div>

    <table v-if="!isLoadingCompletedGames && completedGames.length" class="table table-striped table-hover">
        <thead>
            <tr class="bg-primary">
                <td>Name</td>
                <td class="d-none d-sm-table-cell text-right">Completed</td>
                <td></td>
            </tr>
        </thead>
        <tbody>
            <tr v-for="game in completedGames" v-bind:key="game._id">
                <td>{{game.settings.general.name}}</td>
                <td class="d-none d-sm-table-cell text-right">{{getEndDateFromNow(game)}}</td>
                <td>
                    <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-success float-right">View</router-link>
                </td>
            </tr>
        </tbody>
    </table>

    <div class="text-right" v-if="!isLoadingCompletedGames">
      <router-link to="/game/create" tag="button" class="btn btn-info mr-1">Create Game</router-link>
      <router-link to="/game/list" tag="button" class="btn btn-success">Join New  Game</router-link>
    </div>

  </view-container>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner'
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import gameService from '../services/api/game'
import GameHelper from '../services/gameHelper'
import moment from 'moment'

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

      response = await gameService.listCompletedGames()

      this.completedGames = response.data
    } catch (err) {
      console.error(err)
    }

    this.isLoadingActiveGames = false
    this.isLoadingCompletedGames = false
  },
  methods: {
    getGameStatusText (game) {
      return GameHelper.getGameStatusText(game)
    },
    getEndDateFromNow (game) {
      if (!game.state.endDate) {
        return 'In Progress'
      }

      return moment(game.state.endDate).fromNow()
    }
  }
}
</script>

<style scoped>
</style>
