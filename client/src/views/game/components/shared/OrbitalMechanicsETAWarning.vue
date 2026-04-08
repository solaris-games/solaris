<template>
    <span v-if="isOrbitalMechanicsEnabled" class="text-warning" title="Orbital Mechanics may affect waypoint ETAs">*</span>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import GameHelper from '../../../../services/gameHelper'
import { computed } from 'vue'
import type { Game } from '@/types/game'

const store = useGameStore()

const isOrbitalMechanicsEnabled = computed(() => {
    return GameHelper.isOrbitalMechanicsEnabled(store.game as Game)
})
</script>

<style scoped>
span {
    cursor: pointer;
}
</style>
