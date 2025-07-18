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
      <div class="table-responsive p-0">
        <table class="table table-sm table-striped">
          <tbody>
            <leaderboard-row v-for="player in team.players" :key="player._id" :player="player" :show-team-names="false" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested" />
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import GameHelper from '@/services/gameHelper';
import LeaderboardRow from '@/views/game/components/leaderboard/LeaderboardRow.vue';
import { inject } from 'vue';
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";

export default {
  components: {
    'leaderboard-row': LeaderboardRow
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  methods: {
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
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
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

.team-info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-left: 4px;
  padding-right: 4px;
}

.team-name {
  display: inline;
  color: #4e9cff;
  font-size: 20px;
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
