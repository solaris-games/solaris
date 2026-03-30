<template>
<div class="menu-page container">
    <menu-title title="Research" @onCloseRequested="onCloseRequested"/>

    <p><small>Each point of science on your stars contributes <span class="text-info">{{game.constants.research.sciencePointMultiplier}} point<span v-if="game.constants.research.sciencePointMultiplier > 1">s</span></span> of research every tick towards your chosen technology.</small></p>

    <selection/>

    <h4 class="mt-2">Research Progress</h4>

    <progress-summary/>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MenuTitle from '../MenuTitle.vue'
import Selection from './Selection.vue'
import ProgressSummary from './ProgressSummary.vue'
import type {Game} from "@/types/game";

const emit = defineEmits<{
  onCloseRequested: [],
}>();

const onCloseRequested = () => emit('onCloseRequested');

const store = useGameStore();
const game = computed<Game>(() => store.game!);
</script>

<style scoped>
</style>
