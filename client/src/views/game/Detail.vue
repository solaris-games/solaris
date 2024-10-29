<template>
  <view-container>
    <view-title title="Game Settings" navigation="main-menu"/>

    <loading-spinner :loading="isLoading"/>

    <div v-if="!isLoading">
      <view-subtitle v-bind:title="game.settings.general.name" class="mt-2"/>

      <p class="description" v-if="game.settings.general.description">{{game.settings.general.description}}</p>

      <p v-if="isNewPlayerGame" class="text-warning">New Player Games do not affect Rank or Victories.</p>
      <p v-if="isCustomFeaturedGame" class="text-warning">This is a featured game and will award rank points.</p>

      <p v-for="error of errors" class="text-danger">{{error}}</p>

      <div class="row mb-1 bg-dark pt-2 pb-2">
        <div class="col">
          <router-link to="/game/list" tag="button" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Return to List</router-link>
        </div>
        <div class="col-auto">
          <button class="btn btn-danger" v-if="!game.state.startDate && game.settings.general.isGameAdmin" @click="deleteGame">Delete Game</button>
          <button class="btn btn-warning" v-if="canModifyPauseState() && !game.state.paused" @click="pauseGame">Pause Game</button>
          <button class="btn btn-warning" v-if="canModifyPauseState() && game.state.paused" @click="resumeGame">Resume Game</button>
          <button class="btn btn-danger ms-1" v-if="!game.state.startDate && game.settings.general.isGameAdmin" @click="forceStartGame">Force start Game</button>
          <button class="btn btn-warning ms-1" v-if="game.state.startDate && !game.state.endDate && !game.state.forceTick && game.settings.general.isGameAdmin" @click="fastForwardGame">Fast Forward Game</button>
          <router-link :to="{ path: '/game', query: { id: game._id } }" tag="button" class="btn btn-success ms-1">Open Game <i class="fas fa-arrow-right"></i></router-link>
        </div>
      </div>

      <div class="row mb-2" v-if="game.settings.general.type === 'new_player_rt' || game.settings.general.type === 'new_player_tb' || game.settings.general.type === 'tutorial'">
        <div class="ratio ratio-16x9">
          <iframe src="https://www.youtube.com/embed/cnRXQMQ43Gs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>

      <game-settings :game="game"/>
    </div>
  </view-container>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner.vue'
import ViewTitle from '../components/ViewTitle.vue'
import ViewSubtitle from '../components/ViewSubtitle.vue'
import ViewContainer from '../components/ViewContainer.vue'
import GameSettings from './components/settings/GameSettings.vue'
import gameService from '../../services/api/game'
import router from '../../router'
import GameHelper from '../../services/gameHelper'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'view-subtitle': ViewSubtitle,
    'game-settings': GameSettings
  },
  data () {
    return {
      isLoading: true,
      errors: [],
      game: {
        _id: null,
        settings: {
          general: {
            name: null,
            description: null
          }
        }
      }
    }
  },
  created () {
    this.game._id = this.$route.query.id
  },
  async mounted () {
    await this.loadGame()
  },
  methods: {
    canModifyPauseState () {
      return this.game.settings.general.isGameAdmin
        && GameHelper.isGameStarted(this.game)
        && !GameHelper.isGamePendingStart(this.game)
        && !GameHelper.isGameFinished(this.game);
    },
    async loadGame () {
      this.isLoading = true

      try {
        let response = await gameService.getGameInfo(this.game._id)

        this.game = response.data
      } catch (err) {
        this.errors = err.response.data.errors;
        console.error(err)
      }

      this.isLoading = false
    },
    async pauseGame () {
      if (await this.$confirm('Pause game', 'Are you sure you want to pause this game?')) {
        this.isLoading = true

        try {
          await gameService.pause(this.game._id)

          this.$toast.success(`The game has been paused. Please notify the players.`)

          await this.loadGame()
        } catch (err) {
          this.errors = err.response.data.errors;
          console.error(err)
        }

        this.isLoading = false
      }
    },
    async fastForwardGame () {
      if (await this.$confirm('Fast forward game', 'Are you sure you want to fast forward this game?')) {
        this.isLoading = true

        try {
          await gameService.fastForward(this.game._id)

          this.$toast.success(`The game has been fast forwarded. Please notify the players.`)

          await this.loadGame()
        } catch (err) {
          this.errors = err.response.data.errors;
          console.error(err)
        }

        this.isLoading = false
      }
    },
    async forceStartGame () {
      if (await this.$confirm('Force start game', 'All open slots will be filled with bots. Are you sure you want to force start this game?')) {
        this.isLoading = true

        try {
          await gameService.forceStart(this.game._id)

          this.$toast.success(`The game has been force started. Please notify the players.`)

          await this.loadGame()
        } catch (err) {
          this.errors = err.response.data.errors;
          console.error(this.error);
          console.error(err)
        }

        this.isLoading = false
      }
    },
    async resumeGame () {
      if (await this.$confirm('Resume game', 'Are you sure you want to resume this game?')) {
        this.isLoading = true

        try {
          await gameService.resume(this.game._id)

          this.$toast.success(`The game has been resumed. Please notify the players.`)

          await this.loadGame()
        } catch (err) {
          this.errors = err.response.data.errors;
          console.error(err)
        }

        this.isLoading = false
      }
    },
    async deleteGame () {
      if (await this.$confirm('Delete game', 'Are you sure you want to delete this game?')) {
        this.isLoading = true

        try {
          let response = await gameService.delete(this.game._id)

          if (response.status === 200) {
            router.push({name: 'main-menu'})
          }
        } catch (err) {
          this.errors = err.response.data.errors;
          console.error(err)
        }

        this.isLoading = false
      }
    }
  },
  computed: {
    isNewPlayerGame () {
      return GameHelper.isNewPlayerGame(this.game)
    },
    isFluxGame () {
      return GameHelper.isFluxGame(this.game)
    },
    isCustomFeaturedGame () {
      return GameHelper.isCustomGame(this.game) && GameHelper.isFeaturedGame(this.game)
    }
  }
}
</script>

<style scoped>
.description {
  white-space: pre-wrap;
}
</style>
