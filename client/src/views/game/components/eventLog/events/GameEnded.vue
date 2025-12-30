<template>
  <div>
    <p v-if="!isTeamGame">
      The game has ended, <a href="javascript:;" @click="onOpenWinnerPlayerDetailRequested">{{ getWinnerAlias() }}</a> is the
      winner!
    </p>

    <div v-if="isTeamGame">
      <p>
        The game has ended. {{ getWinningTeamName() }} has won!

        The victorious team members are:
      </p>
      <ul>
        <li v-for="player in getWinningTeamMembers()" :key="player._id">
          <a href="javascript:;" @click="onOpenWinnerPlayerDetailRequested">{{ player.alias }}</a>
        </li>
      </ul>
    </div>

    <p>
      <small>Show your support and award <span class="text-warning">badges</span> and <span
          class="text-warning">renown</span> to your friends and enemies alike.</small>
    </p>

    <!-- Rank Change -->
    <table v-if="hasRankResults" class="table table-sm">
      <thead class="table-dark">
        <tr>
          <th><small>Player</small></th>
          <th class="text-end"><small>Rank Points</small></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="rank in event.data.rankingResult!.ranks" :key="rank.playerId">
          <td><small>{{ getPlayerAlias(rank.playerId) }}</small></td>
          <td class="text-end"><small>{{ rank.current }}<i class="fas fa-arrow-right ms-2 me-2"></i>{{ rank.new }}</small>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- ELO Change -->
    <p v-if="hasEloRatingResult && userPlayerRating && userPlayerRating.newRating != userPlayerRating.oldRating">
      <small>Your ELO rating has changed from <span class="text-info">{{ userPlayerRating.oldRating }}</span> to <span
          class="text-warning">{{ userPlayerRating.newRating }}</span>.</small>
    </p>
    <p v-if="hasEloRatingResult && userPlayerRating && userPlayerRating.newRating === userPlayerRating.oldRating">
      <small>Your ELO is unchanged. (<span class="text-success">{{ userPlayerRating.newRating }}</span>)</small>
    </p>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, computed } from 'vue';
import GameHelper from '../../../../../services/gameHelper';
import type {EloRatingChange, GameEndedEvent} from "@solaris-common";
import { useStore } from 'vuex';
import type {Game} from "@/types/game";

const props = defineProps<{
  event: GameEndedEvent<string>,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();


const store = useStore();
const game = computed<Game>(() => store.state.game);

const isTeamGame = computed(() => GameHelper.isTeamConquest(game.value));
const hasRankResults = computed(() => props.event?.data?.rankingResult?.ranks?.length);
const hasEloRatingResult = computed(() => props.event?.data?.rankingResult?.eloRating);

const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const userPlayerRating = computed(() => {
  if (!userPlayer.value) {
    return null;
  }

  if (hasEloRatingResult.value) {
    if (props.event.data.rankingResult!.eloRating!.winner._id === userPlayer.value._id) {
      return props.event.data.rankingResult!.eloRating!.winner;
    } else {
      return props.event.data.rankingResult!.eloRating!.loser;
    }
  }
});

const onOpenWinnerPlayerDetailRequested = () => emit('onOpenPlayerDetailRequested', game.value.state.winner!);

const getPlayerAlias = (playerId: string) => GameHelper.getPlayerById(game.value, playerId)!.alias;

const getWinnerAlias = () => {
  const winnerPlayer = GameHelper.getPlayerById(game.value, game.value.state.winner!)!;
  return winnerPlayer.alias;
};

const getWinningTeam = () => GameHelper.getTeamById(game.value, game.value.state.winningTeam!);
const getWinningTeamMembers = () => getWinningTeam()?.players.map(id => GameHelper.getPlayerById(game.value, id)!);
const getWinningTeamName = () => getWinningTeam()?.name;
</script>

<style scoped></style>
