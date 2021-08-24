<template>
  <view-container>
    <view-title title="My Games" />

    <div class="row">
      <div class="col">
        <h4>Active Games</h4>
      </div>
      <div class="col-auto">
        <input class="form-check-input" type="checkbox" v-model="includeDefeated" id="chkIncludeDefeated">
        <label class="form-check-label" for="chkIncludeDefeated">
          Show Defeated/AFK
        </label>
      </div>
    </div>

    <loading-spinner :loading="isLoadingActiveGames"/>

    <div v-if="!isLoadingActiveGames && !filteredActiveGames.length">
        <p>You are not in any active games.</p>
    </div>

    <div class="table-responsive">
      <table v-if="!isLoadingActiveGames && filteredActiveGames.length" class="table table-striped table-hover">
          <thead>
              <tr class="bg-primary">
                  <td class="col-9 col-md-6">Name</td>
                  <td class="col-3 d-none d-md-table-cell">Cycle/Turn</td>
                  <td class="col-1 col-md-6 text-center">Players</td>
                  <td class="col-auto"></td>
              </tr>
          </thead>
          <tbody>
              <tr v-for="game in filteredActiveGames" v-bind:key="game._id">
                  <td class="col-6">
                    {{game.settings.general.name}}
                    <span v-if="game.defeated && !game.afk" class="ml-1 badge badge-danger">Defeated</span>
                    <span v-if="!game.defeated && game.turnWaiting" class="ml-1 badge badge-danger">Turn Waiting</span>
                    <span v-if="!game.defeated && game.unread" class="ml-1 badge badge-info">{{game.unread}} Notifications</span>
                    <span v-if="game.afk" class="ml-1 badge badge-warning">AFK</span>
                  </td>
                  <td class="col-3 d-none d-md-table-cell">
                    <span v-if="isGamePendingStart(game)">
                      Starting Soon
                    </span>
                    <span v-if="!isGamePendingStart(game)">
                      <countdown-timer :endDate="getNextCycleDate(game)" :active="true" afterEndText="Pending..."></countdown-timer>
                    </span>
                  </td>
                  <td class="col-1 col-md-6 text-center">{{game.state.players}}/{{game.settings.general.playerLimit}}</td>
                  <td class="col-auto btn-group">
                    <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-primary">View</router-link>
                    <router-link :to="{ path: '/game', query: { id: game._id } }" tag="button" class="btn btn-success">
                      Play
                    </router-link>
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
import CountdownTimer from '../components/CountdownTimer.vue'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'countdown-timer': CountdownTimer
  },
  data () {
    return {
      activeGames: [],
      completedGames: [],
      isLoadingActiveGames: true,
      isLoadingCompletedGames: true,
      includeDefeated: true
    }
  },
  async mounted () {
    try {
      let response = await gameService.listActiveGames()

      this.activeGames = response.data
        .sort((a, b) => (a.defeated - a.afk) - (b.defeated - b.afk))

      response = await gameService.listCompletedGames()

      this.completedGames = response.data
    } catch (err) {
      console.error(err)
    }

    this.isLoadingActiveGames = false
    this.isLoadingCompletedGames = false
  },
  methods: {
    getEndDateFromNow (game) {
      return moment(game.state.endDate).fromNow()
    },
    isRealTimeGame (game) {
      return GameHelper.isRealTimeGame(game);
    },
    isGamePendingStart (game) {
      return GameHelper.isGamePendingStart(game)
    },
    getNextCycleDate (game) {
      // TODO: This doesn't work, for some reason getCountdownTime returns a number wtf
      // if (GameHelper.isGamePendingStart(game)) {
      //   return GameHelper.getCountdownTime(game, game.state.startDate)
      // } else 
      if (GameHelper.isRealTimeGame(game)) {
        return GameHelper.getCountdownTimeForProductionCycle(game)
      } else if (GameHelper.isTurnBasedGame(game)) {
        return GameHelper.getCountdownTimeForTurnTimeout(game)
      }
    }
  },
  computed: {
    filteredActiveGames () {
      if (this.includeDefeated) {
        return this.activeGames
      }

      return this.activeGames.filter(g => !g.defeated)
    }
  }
}
</script>

<style scoped>
</style>
