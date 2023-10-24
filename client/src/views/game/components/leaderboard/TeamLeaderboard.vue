<template>
  <div class="row">
    <div class="team-row" v-for="team in sortedTeams" :key="team.team.name">
      <div class="team-info">
        <h5 class="team-name">
          {{team.team.name}}
          <i v-if="isPlayerTeam(team)" class="userIcon fas fa-user"></i>
        </h5>
        <span v-if="isHomeStarsWinCondition" class="team-score">
          <span class="d-xs-block d-sm-none">
            <i class="fas fa-star me-0"></i> {{team.totalHomeStars}}
          </span>
           <span class="d-none d-sm-block">
             {{team.totalHomeStars}} Star<span v-if="team.totalHomeStars !== 1">s</span>
           </span>
        </span>
        <span v-if="isStarCountWinCondition" class="team-score">
          <span class="d-xs-block d-sm-none">
            <i class="fas fa-star me-0"></i> {{team.totalStars}}
          </span>
           <span class="d-none d-sm-block">
             {{team.totalStars}} Star<span v-if="team.totalStars !== 1">s</span>
           </span>
        </span>
      </div>
      <p class="team-members">
        <span class="team-player-link" v-for="player in team.players" :key="player._id" @click="panToPlayer(player)">
          {{player.alias}}
        </span>
      </p>
    </div>
  </div>
</template>

<script>
import GameHelper from '@/services/gameHelper';
import gameContainer from '@/game/container';

export default {
  methods: {
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e._id)
    },
    panToPlayer (player) {
      gameContainer.map.panToPlayer(this.$store.state.game, player)
      this.onOpenPlayerDetailRequested(player)
    },
    isPlayerTeam (team) {
      const userPlayer = GameHelper.getUserPlayer(this.$store.state.game);

      return userPlayer && team.players.some(p => p._id.toString() === userPlayer._id.toString())
    },
  },
  computed: {
    sortedTeams() {
      return GameHelper.getSortedLeaderboardTeamList(this.$store.state.game)
    },
    isHomeStarsWinCondition () {
      return GameHelper.isWinConditionHomeStars(this.$store.state.game)
    },
    isStarCountWinCondition () {
      return GameHelper.isWinConditionStarCount(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
.team-row {
  display: flex;
  flex-direction: column;
}

.team-info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.team-name {
  display: inline;
  color: #4e9cff;
}

.team-score {
  font-size: 16px;
}

.team-player-link {
  cursor: pointer;
  text-decoration: underline;
  color: var(--bs-theme);
  margin-right: 8px;
}

.team-player-link:hover {
  color: rgba(var(--bs-theme-rgb),.75);
}
</style>
