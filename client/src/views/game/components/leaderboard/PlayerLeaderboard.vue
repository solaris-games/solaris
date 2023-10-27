<template>
  <div class="row">
    <div class="table-responsive p-0">
      <table class="table table-sm table-striped">
        <tbody>
        <tr v-for="player in sortedPlayers" :key="player._id">
          <td :style="{'width': '8px', 'background-color': getFriendlyColour(player.colour.value)}"></td>
          <td class="col-avatar" :title="player.colour.alias + ' ' + player.shape">
            <player-avatar :player="player" @onClick="onOpenPlayerDetailRequested(player)"/>
          </td>
          <td class="ps-2 pt-3 pb-2">
            <!-- Text styling for defeated players? -->
            <h5 class="alias-title">
              {{player.alias}}
              <team-name :player-id="player._id" />
              <span v-if="isKingOfTheHillMode && player.isKingOfTheHill" title="This player is the king of the hill">
                <i class="fas fa-crown"></i>
              </span>
              <span v-if="player.defeated" :title="getPlayerStatus(player)">
                <i v-if="!player.afk" class="fas fa-skull-crossbones" title="This player has been defeated"></i>
                <i v-if="player.afk" class="fas fa-user-clock" title="This player is AFK"></i>
              </span>
              <span v-if="canReadyToQuit && player.readyToQuit" @click="unconfirmReadyToQuit(player)">
                <i class="fas fa-check text-warning" title="This player is ready to quit - Ends the game early if all active players are ready to quit"></i>
              </span>
            </h5>
          </td>
          <td class="fit pt-3 pe-2" v-if="isStarCountWinCondition || isKingOfTheHillMode">
            <span class="d-xs-block d-sm-none">
              <i class="fas fa-star me-0"></i> {{player.stats.totalStars}}
            </span>
            <span class="d-none d-sm-block">
              {{player.stats.totalStars}} Star<span v-if="player.stats.totalStars !== 1">s</span>
            </span>
          </td>
          <td class="fit pt-3 pe-2" v-if="isHomeStarsWinCondition">
            <span class="d-xs-block d-sm-none">
              <i class="fas fa-star me-0"></i> {{player.stats.totalHomeStars}}({{player.stats.totalStars}})
            </span>
            <span class="d-none d-sm-block">
              {{player.stats.totalHomeStars}}({{player.stats.totalStars}}) Star<span v-if="player.stats.totalStars !== 1">s</span>
            </span>
          </td>
          <td class="fit pt-2 pb-2 pe-1 text-center" v-if="isTurnBasedGame && canEndTurn">
            <h5 v-if="player.ready && !isUserPlayer(player)" class="pt-2 pe-2 ps-2">
              <i class="fas fa-check text-success" title="This player has completed their turn"></i>
            </h5>

            <ready-status-button v-if="!$isHistoricalMode() && getUserPlayer() && isUserPlayer(player) && !getUserPlayer().defeated" />
          </td>
          <td class="fit pt-2 pb-2 pe-2">
            <button class="btn btn-outline-info" @click="panToPlayer(player)"><i class="fas fa-eye"></i></button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import gameService from '../../../../services/api/game'
import gameContainer from '../../../../game/container'
import GameHelper from '../../../../services/gameHelper'
import PlayerAvatarVue from '../menu/PlayerAvatar'
import ReadyStatusButtonVue from '../menu/ReadyStatusButton'
import TeamName from '../shared/TeamName';

export default {
  components: {
    'team-name': TeamName,
    'player-avatar': PlayerAvatarVue,
    'ready-status-button': ReadyStatusButtonVue,
  },

  data () {
    return {
      players: []
    }
  },
  mounted () {
    this.players = this.$store.state.game.galaxy.players
  },
  methods: {
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e._id)
    },
    panToPlayer (player) {
      gameContainer.map.panToPlayer(this.$store.state.game, player)
      this.onOpenPlayerDetailRequested(player)
    },
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    getFriendlyColour (colour) {
      return GameHelper.getFriendlyColour(colour)
    },
    isUserPlayer (player) {
      let userPlayer = this.getUserPlayer()

      return userPlayer && userPlayer._id === player._id
    },
    async unconfirmReadyToQuit (player) {
      if (!this.isUserPlayer(player) || this.$isHistoricalMode()) {
        return
      }

      try {
        let response = await gameService.unconfirmReadyToQuit(this.$store.state.game._id)

        if (response.status === 200) {
          player.readyToQuit = false
        }
      } catch (err) {
        console.error(err)
      }
    },
    getPlayerStatus (player) {
      return GameHelper.getPlayerStatus(player)
    }
  },

  computed: {
    game () {
      return this.$store.state.game
    },
    sortedPlayers () {
      return GameHelper.getSortedLeaderboardPlayerList(this.$store.state.game)
    },
    isTurnBasedGame () {
      return this.$store.state.game.settings.gameTime.gameType === 'turnBased'
    },
    isHomeStarsWinCondition () {
      return GameHelper.isWinConditionHomeStars(this.$store.state.game)
    },
    isStarCountWinCondition () {
      return GameHelper.isWinConditionStarCount(this.$store.state.game)
    },
    isConquestAllStars () {
      return GameHelper.isConquestAllStars(this.$store.state.game)
    },
    isConquestHomeStars () {
      return GameHelper.isConquestHomeStars(this.$store.state.game)
    },
    isKingOfTheHillMode () {
      return GameHelper.isKingOfTheHillMode(this.$store.state.game)
    },
    canEndTurn () {
      return !GameHelper.isGameFinished(this.$store.state.game)
    },
    canReadyToQuit () {
      return this.$store.state.game.settings.general.readyToQuit === 'enabled'
        && this.$store.state.game.state.startDate
        && this.$store.state.game.state.productionTick
    }
  }
}
</script>

<style scoped>
.col-avatar {
  position:absolute;
  width: 59px;
  height: 59px;
  cursor: pointer;
  padding: 0;
}

.alias-title {
  padding-left: 59px;
}

table tr {
  height: 59px;
}

.table-sm td {
  padding: 0;
}

.table td.fit,
.table th.fit {
  white-space: nowrap;
  width: 1%;
}

.fa-check {
  cursor: pointer;
}

@media screen and (max-width: 576px) {
  table tr {
    height: 45px;
  }

  .alias-title {
    padding-left: 45px;
  }

  .col-avatar {
    width: 45px;
  }
}

.pulse {
  animation: blinker 1.5s linear infinite;
}

@keyframes blinker {
  50% {
    opacity: 0.3;
  }
}
</style>
