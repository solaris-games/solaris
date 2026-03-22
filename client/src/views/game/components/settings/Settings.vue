<template>
<div class="menu-page container">
    <menu-title title="Settings" @onCloseRequested="onCloseRequested"/>

    <game-settings :game="game"/>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import MenuTitle from '../MenuTitle.vue'
import GameSettings from './GameSettings.vue'
import type {Game} from "@/types/game.ts";

const emit = defineEmits<{
  onCloseRequested: [],
}>();

const onCloseRequested = () => emit('onCloseRequested');

const store = useStore();
const game = computed<Game>(() => store.state.game);
</script>

<style scoped>
</style>
