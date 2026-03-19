<template>
<span v-if="userPlayer && isTechnologyEnabled && isTechnologyResearchable" @click="onViewResearchRequested" :title="researchTooltip">
    <i :class="icon"></i> {{researchProgress}}%
</span>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import GameHelper from '../../../../services/gameHelper'
import TechnologyHelper from '../../../../services/technologyHelper'
import type {Game} from "@/types/game";

const emit = defineEmits<{
  onViewResearchRequested: [],
}>();

const onViewResearchRequested = () => emit('onViewResearchRequested');

const store = useStore();
const game = computed<Game>(() => store.state.game);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value)!);

const icon = computed(() => `fas fa-${TechnologyHelper.getIcon(userPlayer.value.researchingNow)}`);

const isTechnologyEnabled = computed(() => TechnologyHelper.isTechnologyEnabled(game.value, userPlayer.value.researchingNow));
const isTechnologyResearchable = computed(() => TechnologyHelper.isTechnologyResearchable(game.value, userPlayer.value.researchingNow));

const researchTooltip = computed(() => `Researching ${TechnologyHelper.getFriendlyName(userPlayer.value.researchingNow)}`);

const researchProgress = computed(() => {
  const tech = userPlayer.value.research[userPlayer.value.researchingNow];
  const requiredProgress = TechnologyHelper.getRequiredResearchProgress(game.value, userPlayer.value.researchingNow, tech.level);

  return Math.floor(tech.progress! / requiredProgress * 100)
});
</script>

<style scoped>
span {
    cursor: pointer;
}
</style>
