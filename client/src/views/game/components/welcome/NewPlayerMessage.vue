<template>
  <p v-if="isGameNotStarted && isNewPlayerGame" class="text-center">
    <small>This game is for <span class="text-success">new players</span>, it will start when <span class="text-warning">2 players</span> have joined the game.</small>
  </p>
</template>

<script setup lang="ts">
import GameHelper from '../../../../services/gameHelper'
import { computed } from 'vue'
import type { Game } from '@/types/game'

const store = useGameStore()

const isGameNotStarted = computed(() => {
    return GameHelper.isGameNotStarted(store.game as Game)
})

const isNewPlayerGame = computed(() => {
    return GameHelper.isNewPlayerGame(store.game as Game)
})
</script>

<style scoped>
</style>
