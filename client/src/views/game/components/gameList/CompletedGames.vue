<template>
  <div>
    <h4>Completed Games</h4>

    <loading-spinner :loading="isLoadingCompletedGames"/>

    <div v-if="!isLoadingCompletedGames && !completedGames.length">
      <p>You have not completed any games yet.</p>
    </div>

    <table v-if="!isLoadingCompletedGames && completedGames.length" class="table table-striped table-hover">
        <thead class="table-dark">
            <tr>
                <td>Name</td>
                <td class="d-none d-sm-table-cell text-end">Completed</td>
                <td></td>
            </tr>
        </thead>
        <tbody>
            <tr v-for="game in completedGames" v-bind:key="game._id">
                <td>
                  <span v-if="game.userNotifications.position === 1" class="me-1"><i class="fas fa-medal gold"></i></span>
                  <span v-if="game.userNotifications.position === 2" class="me-1"><i class="fas fa-medal silver"></i></span>
                  <span v-if="game.userNotifications.position === 3" class="me-1"><i class="fas fa-medal bronze"></i></span>
                  <span v-if="isTeamGame(game)" class="me-1"><i class="fas fa-users"></i></span>
                  <router-link :to="{ path: '/game/detail', query: { id: game._id } }" class="me-1">{{game.settings.general.name}}</router-link>
                  <br/>
                  <small>{{getGameTypeFriendlyText(game)}}</small>
                  <br/>
                  <span v-if="game.userNotifications.unreadConversations" class="me-1 badge bg-info">{{game.userNotifications.unreadConversations}} Messages</span>
                </td>
                <td class="d-none d-sm-table-cell text-end">{{getEndDateFromNow(game)}}</td>
                <td>
                    <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-outline-success float-end">View</router-link>
                </td>
            </tr>
        </tbody>
    </table>

    <div class="text-end" v-if="!isLoadingCompletedGames">
      <router-link to="/game/create" tag="button" class="btn btn-info me-1"><i class="fas fa-gamepad"></i> Create Game</router-link>
      <router-link to="/game/list" tag="button" class="btn btn-success">Join New  Game <i class="fas fa-arrow-right"></i></router-link>
    </div>
  </div>
</template>

<script>
import LoadingSpinnerVue from '../../../components/LoadingSpinner.vue'
import gameService from '../../../../services/api/game'
import GameHelper from '../../../../services/gameHelper'
import moment from 'moment'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue
  },
  data () {
    return {
      completedGames: [],
      isLoadingCompletedGames: true
    }
  },
  mounted () {
    this.loadCompletedGames()
  },
  methods: {
    async loadCompletedGames () {
      this.isLoadingCompletedGames = true

      try {
        let response = await gameService.listMyCompletedGames()

        this.completedGames = response.data
      } catch (err) {
        console.error(err)
      }

      this.isLoadingCompletedGames = false
    },
    getEndDateFromNow (game) {
      return moment(game.state.endDate).fromNow()
    },
    isRealTimeGame (game) {
      return GameHelper.isRealTimeGame(game);
    },
    getGameTypeFriendlyText (game) {
      return GameHelper.getGameTypeFriendlyText(game)
    },
    isTeamGame (game) {
      return GameHelper.isTeamConquest(game)
    }
  }
}
</script>

<style scoped>
.gold {
  color: gold;
}

.silver {
  color: silver;
}

.bronze {
  color: #b08d57;
}
</style>
