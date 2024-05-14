<template>
<div>
  <p v-if="!isTeamGame">
    The game has ended, <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{getWinnerAlias()}}</a> is the winner!
  </p>

  <p v-if="isTeamGame">
    The game has ended. {{getWinningTeamName()}} has won!

    The victorious team members are:

    <ul>
      <li v-for="player in getWinningTeamMembers()" :key="player._id">
        <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{player.alias}}</a>
      </li>
    </ul>
  </p>

  <p>
    <small>Show your support and award <span class="text-warning">badges</span> and <span class="text-warning">renown</span> to your friends and enemies alike.</small>
  </p>

  <!-- Rank Change -->
  <table v-if="hasRankResults" class="table table-sm">
    <thead class="table-dark">
      <tr>
        <td><small>Player</small></td>
        <td class="text-end"><small>Rank Points</small></td>
      </tr>
    </thead>
    <tbody>
      <tr v-for="rank in event.data.rankingResult.ranks" :key="rank.playerId">
        <td><small>{{getPlayerAlias(rank.playerId)}}</small></td>
        <td class="text-end"><small>{{rank.current}}<i class="fas fa-arrow-right ms-2 me-2"></i>{{rank.new}}</small></td>
      </tr>
    </tbody>
  </table>

  <!-- ELO Change -->
  <p v-if="hasEloRatingResult && userPlayerRating && userPlayerRating.newRating != userPlayerRating.oldRating">
    <small>Your ELO rating has changed from <span class="text-info">{{userPlayerRating.oldRating}}</span> to <span class="text-warning">{{userPlayerRating.newRating}}</span>.</small>
  </p>
  <p v-if="hasEloRatingResult && userPlayerRating && userPlayerRating.newRating === userPlayerRating.oldRating">
    <small>Your ELO is unchanged. (<span class="text-success">{{userPlayerRating.newRating}}</span>)</small>
  </p>
</div>
</template>

<script>
import GameHelper from '../../../../../services/gameHelper'

export default {
  components: {

  },
  props: {
    event: Object
  },
  data () {
    return {
      userPlayerRating: null
    }
  },
  mounted () {
    let userPlayer = GameHelper.getUserPlayer(this.$store.state.game)

    if (this.hasEloRatingResult) {
      if (this.event.data.rankingResult.eloRating.winner._id === userPlayer._id) {
        this.userPlayerRating = this.event.data.rankingResult.eloRating.winner
      } else {
        this.userPlayerRating = this.event.data.rankingResult.eloRating.loser
      }
    }
  },
  methods: {
    getWinningTeam () {
      return GameHelper.getTeamById(this.$store.state.game, this.$store.state.game.state.winningTeam)
    },
    getWinningTeamMembers () {
      return this.getWinningTeam().players.map(id => GameHelper.getPlayerById(this.$store.state.game, id))
    },
    getWinningTeamName () {
      return this.getWinningTeam().name
    },
    getWinnerAlias () {
      let winnerPlayer = GameHelper.getPlayerById(this.$store.state.game, this.$store.state.game.state.winner)

      return winnerPlayer.alias
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', this.$store.state.game.state.winner)
    },
    getPlayerAlias (playerId) {
      return GameHelper.getPlayerById(this.$store.state.game, playerId).alias
    }
  },
  computed: {
    isTeamGame () {
      return GameHelper.isTeamConquest(this.$store.state.game)
    },
    hasRankResults () {
      return this.event.data && this.event.data.rankingResult && this.event.data.rankingResult.ranks && this.event.data.rankingResult.ranks.length
    },
    hasEloRatingResult () {
      return this.event.data && this.event.data.rankingResult && this.event.data.rankingResult.eloRating
    }
  }
}
</script>

<style scoped>
</style>
