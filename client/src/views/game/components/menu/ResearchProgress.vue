<template>
  <span
    v-if="userPlayer && isTechnologyEnabled && isTechnologyResearchable"
    @click="onViewResearchRequested"
    :title="researchTooltip"
  >
    <i :class="icon"></i> {{ researchProgress }}%
  </span>
</template>
<script setup lang="ts">
import { useGameStore } from "@/stores/game";
import { computed } from "vue";
import GameHelper from "../../../../services/gameHelper";
import TechnologyHelper from "../../../../services/technologyHelper";
import type { Game } from "@/types/game";
import { useGameServices } from "@/util/gameServices.ts";

const emit = defineEmits<{
  onViewResearchRequested: [];
}>();

const onViewResearchRequested = () => emit("onViewResearchRequested");

const store = useGameStore();
const services = useGameServices();

const game = computed<Game>(() => store.game!);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value)!);

const icon = computed(
  () => `fas fa-${TechnologyHelper.getIcon(userPlayer.value.researchingNow)}`,
);

const isTechnologyEnabled = computed(() =>
  services.technologyService.isTechnologyEnabled(
    game.value,
    userPlayer.value.researchingNow,
  ),
);
const isTechnologyResearchable = computed(() =>
  services.technologyService.isTechnologyResearchable(
    game.value,
    userPlayer.value.researchingNow,
  ),
);

const researchTooltip = computed(
  () =>
    `Researching ${TechnologyHelper.getFriendlyName(userPlayer.value.researchingNow)}`,
);

const researchProgress = computed(() => {
  const tech = userPlayer.value.research[userPlayer.value.researchingNow];
  const requiredProgress =
    services.researchProgressService.getRequiredResearchProgress(
      game.value,
      userPlayer.value.researchingNow,
      tech.level,
    );

  return Math.floor((tech.progress! / requiredProgress) * 100);
});
</script>

<style scoped>
span {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
}
</style>
