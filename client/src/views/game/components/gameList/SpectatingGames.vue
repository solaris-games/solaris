<template>
  <div v-if="games.length">
    <h4>Spectating</h4>

    <table class="table table-striped table-hover">
      <thead class="table-dark">
        <tr>
          <td>Name</td>
          <td class="d-none d-sm-table-cell text-end">Players</td>
          <td>Cycle/Turn</td>
          <td></td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="game in games" v-bind:key="game._id">
          <td>
            <router-link :to="{ path: '/game/detail', query: { id: game._id } }"
              class="me-1">{{ game.settings.general.name }}</router-link>
            <br />
            <small>{{ getGameTypeFriendlyText(game) }}</small>
          </td>
          <td class="col-3 d-none d-md-table-cell">
            <span v-if="isGameWaitingForPlayers(game)">
              Waiting for Players
            </span>
            <span v-if="isGamePendingStart(game)">
              Starting Soon
            </span>
            <span v-if="isGameInProgress(game)">
              <countdown-timer :endDate="getNextCycleDate(game)" :active="true"
                afterEndText="Pending..."></countdown-timer>
            </span>
          </td>
          <td class="d-none d-sm-table-cell text-end">{{ game.state.players }}/{{ game.settings.general.playerLimit }}</td>
          <td>
            <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button"
              class="btn btn-outline-success float-end">View</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import LoadingSpinnerVue from '../../../components/LoadingSpinner.vue'
import gameService from '../../../../services/api/game'
import GameHelper from '../../../../services/gameHelper'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue
  },
  data() {
    return {
      games: []
    }
  },
  mounted() {
    this.loadGames()
  },
  methods: {
    async loadGames() {
      try {
        let response = await gameService.listSpectatingGames()

        this.games = response.data
      } catch (err) {
        console.error(err)
      }
    },
    getGameTypeFriendlyText(game) {
      return GameHelper.getGameTypeFriendlyText(game)
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
  }
}
</script>

<style scoped></style>
