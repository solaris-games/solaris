<template>
  <div>
    <div class="row">
      <div class="col">
        <h4>Active Games</h4>
      </div>
      <div class="col-auto">
        <input class="form-check-input me-1" type="checkbox" v-model="includeDefeated" id="chkIncludeDefeated">
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
          <thead class="table-dark">
              <tr>
                  <td class="col-9 col-md-6">Name</td>
                  <td class="col-3 d-none d-md-table-cell">Cycle/Turn</td>
                  <td class="col-1 col-md-6 text-center">Players</td>
                  <td class="col-auto"></td>
              </tr>
          </thead>
          <tbody>
              <tr v-for="game in filteredActiveGames" v-bind:key="game._id">
                  <td class="col-6">
                    <router-link :to="{ path: '/game/detail', query: { id: game._id } }" class="me-1">{{game.settings.general.name}}</router-link>
                    <br/>
                    <small>{{getGameTypeFriendlyText(game)}}</small>
                    <br/>
                    <span v-if="game.userNotifications.defeated && !game.userNotifications.afk" class="me-1 badge bg-danger">Defeated</span>
                    <span v-if="!game.userNotifications.defeated && game.userNotifications.turnWaiting" class="me-1 badge bg-danger">Turn Waiting</span>
                    <span v-if="!game.userNotifications.defeated && game.userNotifications.unreadEvents" class="me-1 badge bg-warning">{{game.userNotifications.unreadEvents}} Events</span>
                    <span v-if="game.userNotifications.afk" class="me-1 badge bg-warning">AFK</span>
                    <span v-if="game.userNotifications.unreadConversations" class="me-1 badge bg-info">{{game.userNotifications.unreadConversations}} Messages</span>

                    <div class="d-md-none text-info">
                      <small>
                        <span v-if="isGameWaitingForPlayers(game)">
                          Waiting for Players
                        </span>
                        <span v-if="isGamePendingStart(game)">
                          Starting Soon
                        </span>
                        <span v-if="isGameInProgress(game)">
                          <countdown-timer :endDate="getNextCycleDate(game)" :active="true" afterEndText="Pending..."></countdown-timer>
                        </span>
                      </small>
                    </div>
                  </td>
                  <td class="col-3 d-none d-md-table-cell">
                    <span v-if="isGameWaitingForPlayers(game)">
                      Waiting for Players
                    </span>
                    <span v-if="isGamePendingStart(game)">
                      Starting Soon
                    </span>
                    <span v-if="isGameInProgress(game)">
                      <countdown-timer :endDate="getNextCycleDate(game)" :active="true" afterEndText="Pending..."></countdown-timer>
                    </span>
                  </td>
                  <td class="col-1 col-md-6 text-center">{{game.state.players}}/{{game.settings.general.playerLimit}}</td>
                  <td class="col-auto">
                    <div class="btn-group">
                      <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-primary">View</router-link>
                      <router-link :to="{ path: '/game', query: { id: game._id } }" tag="button" class="btn btn-success">
                        Play
                      </router-link>
                    </div>
                  </td>
              </tr>
          </tbody>
      </table>
    </div>

    <div class="text-end" v-if="!isLoadingActiveGames">
      <router-link to="/game/create" tag="button" class="btn btn-info me-1"><i class="fas fa-gamepad"></i> Create Game</router-link>
      <router-link to="/game/list" tag="button" class="btn btn-success">Join New  Game <i class="fas fa-arrow-right"></i></router-link>
    </div>
  </div>
</template>

<script>
import LoadingSpinnerVue from '../../../components/LoadingSpinner.vue'
import gameService from '../../../../services/api/game'
import GameHelper from '../../../../services/gameHelper'
import CountdownTimer from '../CountdownTimer.vue'
import { loadLocalPreference, storeLocalPreference } from '@/util/localPreference';

const INCLUDE_DEFEATED_PREF_KEY = 'activeGamesIncludeDefeated';

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'countdown-timer': CountdownTimer
  },
  data () {
    return {
      activeGames: [],
      isLoadingActiveGames: true,
      includeDefeated: loadLocalPreference('INCLUDE_DEFEATED_PREF_KEY', true),
    }
  },
  mounted () {
    this.loadActiveGames()
  },
  methods: {
    async loadActiveGames () {
      this.isLoadingActiveGames = true

      try {
        let response = await gameService.listActiveGames()

        this.activeGames = response.data
          .sort((a, b) => (a.userNotifications.defeated - a.userNotifications.afk) - (b.userNotifications.defeated - b.userNotifications.afk))
      } catch (err) {
        console.error(err)
      }

      this.isLoadingActiveGames = false
    },
    isRealTimeGame (game) {
      return GameHelper.isRealTimeGame(game);
    },
    isGameWaitingForPlayers (game) {
      return GameHelper.isGameWaitingForPlayers(game)
    },
    isGamePendingStart (game) {
      return GameHelper.isGamePendingStart(game)
    },
    isGameInProgress (game) {
      return GameHelper.isGameInProgress(game)
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
    },
    getGameTypeFriendlyText (game) {
      return GameHelper.getGameTypeFriendlyText(game)
    }
  },
  computed: {
    filteredActiveGames () {
      if (this.includeDefeated) {
        return this.activeGames
      }

      return this.activeGames.filter(g => !g.userNotifications.defeated)
    }
  },
  watch: {
    includeDefeated: (oldVal, newVal) => {
      storeLocalPreference(INCLUDE_DEFEATED_PREF_KEY, newVal);
    }
  }
}
</script>

<style scoped>
</style>
