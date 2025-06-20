<template>
  <div class="row mb-1 bg-dark pt-2 pb-2" v-if="game.settings.general.isGameAdmin">
    <div class="col">
      <button class="btn btn-danger" v-if="!game.state.startDate"
              @click="deleteGame">Delete Game
      </button>
      <button class="btn btn-warning" v-if="canModifyPauseState() && !game.state.paused" @click="pauseGame">Pause
        Game
      </button>
      <button class="btn btn-warning" v-if="canModifyPauseState() && game.state.paused" @click="resumeGame">Resume
        Game
      </button>
      <button class="btn btn-danger ms-1" v-if="!game.state.startDate"
              @click="forceStartGame(false)">Force start Game
      </button>
      <button class="btn btn-danger ms-1" v-if="!game.state.startDate"
              @click="forceStartGame(true)">Force start Game (keep slots open)
      </button>
      <button class="btn btn-warning ms-1"
              v-if="game.state.startDate && !game.state.endDate && !game.state.forceTick"
              @click="fastForwardGame">Fast Forward Game
      </button>

      <view-collapse-panel @onToggle="togglePlayerControl" title="Player Control">
        <game-player-control :game="fullGame" @onGameModified="loadFullGame"/>
      </view-collapse-panel>

      <div v-if="errors" class="alert alert-danger mt-2" role="alert">
        <p class="text-danger" v-for="error in errors">{{ error }}</p>
      </div>
    </div>
  </div>
</template>
<script>
import GameHelper from '../../services/gameHelper'
import ViewCollapsePanel from '../components/ViewCollapsePanel.vue'
import GamePlayerControl from './GamePlayerControl.vue';
import gameService from '../../services/api/game'
import router from "../../router.js";

export default {
  components: {
    'view-collapse-panel': ViewCollapsePanel,
    'game-player-control': GamePlayerControl,
  },
  props: {
    game: Object,
  },
  data() {
    return {
      fullGame: null,
      errors: null,
    }
  },
  methods: {
    canModifyPauseState() {
      return this.game.settings.general.isGameAdmin
        && GameHelper.isGameStarted(this.game)
        && !GameHelper.isGamePendingStart(this.game)
        && !GameHelper.isGameFinished(this.game);
    },
    async togglePlayerControl(collapsed) {
      if (!collapsed && !this.fullGame) {
        await this.loadFullGame();
      }
    },
    async loadFullGame() {
      const resp = await gameService.getGameGalaxy(this.game._id);

      this.fullGame = resp.data;
    },
    async pauseGame() {
      if (await this.$confirm('Pause game', 'Are you sure you want to pause this game?')) {
        this.isLoading = true

        try {
          await gameService.pause(this.game._id)

          this.$toast.success(`The game has been paused. Please notify the players.`)

          await this.loadFullGame()
        } catch (err) {
          this.errors = err.response.data.errors;
          console.error(err)
        }

        this.isLoading = false
      }
    },
    async fastForwardGame() {
      if (await this.$confirm('Fast forward game', 'Are you sure you want to fast forward this game?')) {
        this.isLoading = true

        try {
          await gameService.fastForward(this.game._id)

          this.$toast.success(`The game has been fast forwarded. Please notify the players.`)

          await this.loadFullGame()
        } catch (err) {
          this.errors = err?.response?.data.errors;
          console.error(err)
        }

        this.isLoading = false
      }
    },
    async forceStartGame(withOpenSlots) {
      if (await this.$confirm('Force start game', 'All open slots will be filled with bots. Are you sure you want to force start this game?')) {
        this.isLoading = true

        try {
          await gameService.forceStart(this.game._id, withOpenSlots)

          this.$toast.success(`The game has been force started. Please notify the players.`)

          await this.loadFullGame()
        } catch (err) {
          this.errors = err?.response?.data.errors;
          console.error(this.error);
          console.error(err)
        }

        this.isLoading = false
      }
    },
    async resumeGame() {
      if (await this.$confirm('Resume game', 'Are you sure you want to resume this game?')) {
        this.isLoading = true

        try {
          await gameService.resume(this.game._id)

          this.$toast.success(`The game has been resumed. Please notify the players.`)

          await this.loadFullGame()
        } catch (err) {
          this.errors = err?.response?.data.errors;
          console.error(err)
        }

        this.isLoading = false
      }
    },
    async deleteGame() {
      if (await this.$confirm('Delete game', 'Are you sure you want to delete this game?')) {
        this.isLoading = true

        try {
          let response = await gameService.delete(this.game._id)

          if (response.status === 200) {
            router.push({name: 'main-menu'})
          }
        } catch (err) {
          this.errors = err?.response?.data.errors;
          console.error(err)
        }

        this.isLoading = false
      }
    }
  }
}
</script>
<style scoped></style>
