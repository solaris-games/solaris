<template>
<div class="menu-page container">
    <menu-title title="Settings" @onCloseRequested="onCloseRequested"/>

    <game-settings :game="game"/>
</div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { computed } from 'vue';
import MenuTitle from '../MenuTitle.vue'
import GameSettings from './GameSettings.vue'
import type {Game} from "@/types/game.ts";

const emit = defineEmits<{
  onCloseRequested: [],
}>();

const onCloseRequested = () => emit('onCloseRequested');

const store = useGameStore();
const game = computed<Game>(() => store.game!);
</script>

<style scoped>
</style>
