<template>
  <administration-page title="Recent games" name="games">
    <loading-spinner :loading="!games"/>

    <div v-if="games">
      <table class="mt-2 table table-sm table-striped table-responsive">
        <thead class="table-dark">
        <tr>
          <th>Name</th>
          <th>Players</th>
          <th>Settings</th>
          <th>Started</th>
          <th>Ended</th>
          <th>Tick</th>
          <th></th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="game of games" :key="game._id">
          <td>
            {{ game.settings.general.name }}
            <br/>
            <small>{{ game.settings.general.type }}</small>
          </td>
          <td>
            {{ game.state.players }}/{{ game.settings.general.playerLimit }}
          </td>
          <td>
            <i class="clickable fas"
               :class="{'fa-star text-success':game.settings.general.featured,'fa-star text-danger':!game.settings.general.featured}"
               @click="toggleFeaturedGame(game)" title="Featured"></i>
            <i class="clickable ms-1 fas"
               :class="{'fa-clock text-success':game.settings.general.timeMachine === 'enabled','fa-clock text-danger':game.settings.general.timeMachine === 'disabled'}"
               @click="toggleTimeMachineGame(game)" v-if="isGameMaster" title="Time Machine"></i>
          </td>
          <td><i class="fas"
                 :class="{'fa-check text-success':game.state.startDate,'fa-times text-danger':!game.state.startDate}"
                 :title="game.state.startDate"></i></td>
          <td>
            <i class="clickable fas"
               :class="{'fa-check text-success':game.state.endDate,'fa-times text-danger':!game.state.endDate}"
               :title="game.state.endDate"
               @click="forceGameFinish(game)"></i>
          </td>
          <td :class="{'text-warning':gameNeedsAttention(game)}">{{ game.state.tick }}</td>
          <td>
            <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button"
                         class="btn btn-outline-success btn-sm">View
            </router-link>
          </td>
          <td>
            <button v-if="isAdministrator" class="btn btn-outline-warning btn-sm" @click="resetQuitters(game)">Reset
              quitters
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </administration-page>
</template>

<script>
import LoadingSpinner from "../components/LoadingSpinner.vue";
import AdminApiService from "../../services/api/admin";
import moment from "moment/moment";
import AdministrationPage from "./AdministrationPage.vue";

export default {
  name: "Games",
  components: {
    'administration-page': AdministrationPage,
    'loading-spinner': LoadingSpinner
  },
  data() {
    return {
      games: null
    }
  },
  async mounted() {
    this.games = await this.getGames();
  },
  methods: {
    async getGames() {
      const resp = await AdminApiService.getGames()

      if (resp.status !== 200) {
        this.$toast.error(resp.data.message)
        return null
      }

      return resp.data
    },
    async resetQuitters (game) {
      try {
        await AdminApiService.resetQuitters(game._id);
      } catch (err) {
        console.error(err)
      }
    },
    async toggleFeaturedGame (game) {
      try {
        game.settings.general.featured = !game.settings.general.featured

        await AdminApiService.setGameFeatured(game._id, game.settings.general.featured)
      } catch (err) {
        console.error(err)
      }
    },
    async forceGameFinish (game) {
      if (!this.isAdministrator || !game.state.startDate || game.state.endDate) {
        return
      }

      if (!await this.$confirm('Force Game Finish', 'Are you sure you want to force this game to finish?')) {
        return
      }

      try {
        game.state.endDate = moment().utc()

        await AdminApiService.forceGameFinish(game._id)
      } catch (err) {
        console.error(err)
      }
    },
    async toggleTimeMachineGame (game) {
      try {
        if (game.settings.general.timeMachine === 'enabled') {
          game.settings.general.timeMachine = 'disabled'
        } else {
          game.settings.general.timeMachine = 'enabled'
        }

        await AdminApiService.setGameTimeMachine(game._id, game.settings.general.timeMachine)
      } catch (err) {
        console.error(err)
      }
    },
    gameNeedsAttention (game) {
      return game.state.endDate && game.state.tick <= 12
    }
  },
  computed: {
    isAdministrator() {
      return this.$store.state.roles.administrator
    },
    isCommunityManager() {
      return this.isAdministrator || this.$store.state.roles.communityManager
    },
    isGameMaster() {
      return this.isAdministrator || this.$store.state.roles.gameMaster
    }
  }
}
</script>

<style scoped>

</style>
