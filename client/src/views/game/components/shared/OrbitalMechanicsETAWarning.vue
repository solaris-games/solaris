<template>
    <span v-if="isOrbitalMechanicsEnabled" class="text-warning" title="Orbital Mechanics may affect waypoint ETAs">*</span>
</template>

<script setup lang="ts">
import GameHelper from '../../../../services/gameHelper'
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { Game } from '@/types/game'

const store = useStore()

const isOrbitalMechanicsEnabled = computed(() => {
    return GameHelper.isOrbitalMechanicsEnabled(store.state.game as Game)
})
</script>

<style scoped>
span {
    cursor: pointer;
}
</style>
