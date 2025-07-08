<template>
  <div class="row mb-2" v-if="!game.state.endDate">
    <div class="col text-center pt-2">
      <p class="mb-0 text-warning" v-if="isConquestAllStars">Be the first to capture {{ game.state.starsForVictory }}
        of {{ game.state.stars }} stars</p>
      <p class="mb-0 text-warning" v-if="isConquestHomeStars">Be the first to capture {{ game.state.starsForVictory }}
        of {{ game.settings.general.playerLimit }} capital stars</p>
      <p class="mb-0 text-warning" v-if="isTeamConquest && isStarCountWin">Be the first team to capture
        {{ game.state.starsForVictory }} of {{ game.state.stars }} stars</p>
      <p class="mb-0 text-warning" v-if="isTeamConquest && isHomeStarCountWinCondition">Be the first team to capture
        {{ game.state.starsForVictory }} of {{ game.settings.general.playerLimit }} capital stars</p>
      <p class="mb-0 text-warning" v-if="isKingOfTheHillMode">Capture and hold the center star to win</p>
      <p class="mb-0" v-if="game.settings.general.mode === 'battleRoyale'">Battle Royale - {{ game.state.stars }}
        Stars Remaining</p>
      <p class="mb-0" v-if="isKingOfTheHillMode && game.state.ticksToEnd == null"><small>The countdown begins when the
        center star is captured</small></p>
      <p class="mb-0 text-danger" v-if="game.state.ticksToEnd != null">Countdown - {{ game.state.ticksToEnd }}
        Tick<span v-if="game.state.ticksToEnd !== 1">s</span> Remaining
        <help-tooltip v-if="isKingOfTheHillMode"
                      tooltip="The countdown will reset to 1 cycle if the center star is captured with less than 1 cycle left" />
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import HelpTooltip from "@/views/components/HelpTooltip.vue";
import { type Game } from "@/types/game";
import GameHelper from "@/services/gameHelper";
import { computed } from "vue";

const props = defineProps<{
  game: Game,
}>();

const isConquestAllStars = computed(() => GameHelper.isConquestAllStars(props.game));
const isConquestHomeStars = computed(() => GameHelper.isConquestHomeStars(props.game));
const isKingOfTheHillMode = computed(() => GameHelper.isKingOfTheHillMode(props.game));
const isTeamConquest = computed(() => GameHelper.isTeamConquest(props.game));
const isStarCountWin = computed(() => GameHelper.isWinConditionStarCount(props.game));
const isHomeStarCountWinCondition = computed(() => GameHelper.isWinConditionHomeStars(props.game));
</script>

<style scoped>

</style>
