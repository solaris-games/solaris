<template>
<div class="menu-page container pb-2">
    <menu-title :title="title" @onCloseRequested="onCloseRequested"/>

    <div class="row pb-2">
        <div class="col">
            <button type="button" title="Next" class="btn btn-primary" @click="prevPage()" v-if="page > 0"><i class="fas fa-arrow-left me-1"></i>Previous</button>
        </div>
        <div class="col-auto">
            <button type="button" title="Next" class="btn btn-success" @click="nextPage()" v-if="page >= 0 && page < maxPage">Next<i class="fas fa-arrow-right ms-1"></i></button>
        </div>
    </div>

    <component v-bind:is="currentTutorialComponent" v-bind="tutorialProps"></component>

</div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { ref, computed, onMounted } from 'vue';
import MenuTitle from '../MenuTitle.vue';
import type {Game} from "@/types/game";
import type {TutorialProps} from "@/views/game/components/tutorial/tutorial";
import GameHelper from "@/services/gameHelper.ts";
import { useTutorialStore } from '@/stores/tutorial';
import TutorialOriginal from './TutorialOriginal.vue';
import TutorialFleetMovement from './TutorialFleetMovement.vue';
import TutorialStarsAndCarriers from './TutorialStarsAndCarriers.vue';
import TutorialInfrastructureAndExpansion from './TutorialInfrastructureAndExpansion.vue';
import TutorialScienceAndResearch from './TutorialScienceAndResearch.vue';
import TutorialCombatBasics from './TutorialCombatBasics.vue';
import TutorialSpecialStarTypes from './TutorialSpecialStarTypes.vue';

const defaultTutorialKey = "original";

const tutorialComponents: Record<string, any> = {
  'original': TutorialOriginal,
  'fleet-movement': TutorialFleetMovement,
  'stars-and-carriers': TutorialStarsAndCarriers,
  'infrastructure-and-expansion': TutorialInfrastructureAndExpansion,
  'science-and-research': TutorialScienceAndResearch,
  'combat-basics': TutorialCombatBasics,
  'special-star-types': TutorialSpecialStarTypes,
};

const emit = defineEmits<{
  onCloseRequested: [],
  onOpenStarDetailRequested: [starId: string],
}>();

const onCloseRequested = () => emit('onCloseRequested');

const store = useGameStore();
const tutorialStore = useTutorialStore();
const game = computed<Game>(() => store.game!);
const title = ref("Tutorial");
const tutorialKey = ref(game.value.settings.general.createdFromTemplate || defaultTutorialKey);
const page = ref(0);
const maxPage = ref(0);

const isTutorialCompleted = computed(() => page.value === -1);
const currentTutorialComponent = computed(() => tutorialComponents[tutorialKey.value] || tutorialComponents[defaultTutorialKey]);

const setTutorialCompleted = () => {
  page.value = -1;
  tutorialStore.setTutorialKey(tutorialKey.value);
  tutorialStore.setTutorialPage(page.value);
};

const tutorialProps = computed<TutorialProps>(() => {
  const player = GameHelper.getUserPlayer(game.value)!;

  return ({
    page: page.value,
    player,
    game: game.value,
    setTutorial: (t, mp) => {
      title.value = t;
      maxPage.value = mp;
    },
    setTutorialCompleted,
    isTutorialCompleted: isTutorialCompleted.value,
    onOpenStarDetailRequested: (starId) => emit('onOpenStarDetailRequested', starId),
    startingStars: game.value.settings.player.startingStars,
    playerHomeStar: GameHelper.getPlayerHomeStar(player, game.value.galaxy.stars)!,
    playerStars: game.value.galaxy.stars.filter((st) => st.ownedByPlayerId === player._id),
    starsForVictory: game.value.state.starsForVictory,
  });
});

const nextPage = () => {
  page.value = page.value + 1;
  tutorialStore.setTutorialKey(tutorialKey.value);
  tutorialStore.setTutorialPage(page.value);
};

const prevPage = () => {
  page.value = Math.max(0, page.value - 1);
  tutorialStore.setTutorialKey(tutorialKey.value);
  tutorialStore.setTutorialPage(page.value);
};

onMounted(() => {
  // Load current tutorial page from store only if the tutorial key matches
  if (tutorialStore.tutorialKey === tutorialKey.value) {
    page.value = tutorialStore.currentPage;
  }
});
</script>

<style scoped>
</style>
