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

<script setup lang="ts">
import GameHelper from '@/services/gameHelper';
import LeaderboardRow from '@/views/game/components/leaderboard/LeaderboardRow.vue';
import { inject } from 'vue';
import {eventBusInjectionKey} from "@/eventBus";
import type {Game} from "@/types/game";
import { useStore } from 'vuex';
import { computed } from 'vue';
import type {Team} from "@solaris-common";
import type {TeamLeaderboardData} from "@/types/leaderboard.ts";

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const onOpenPlayerDetailRequested = (e: string) => emit('onOpenPlayerDetailRequested', e);

const eventBus = inject(eventBusInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.game);


const sortedTeams = computed(() => GameHelper.getSortedLeaderboardTeamList(game.value));
const isHomeStarsWinCondition = computed(() => GameHelper.isWinConditionHomeStars(game.value));
const isStarCountWinCondition = computed(() => GameHelper.isWinConditionStarCount(game.value));

const isPlayerTeam = (team: TeamLeaderboardData) => {
  const userPlayer = GameHelper.getUserPlayer(game.value);

  return userPlayer && team.players.some(p => p._id.toString() === userPlayer._id.toString())
};
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
