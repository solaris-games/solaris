<template>
<div class="bg-warning container" v-if="isSpectating">
    <div class="row pt-2 pb-2">
        <div class="col">
            <p class="mt-0 mb-0">You are spectating this game.</p>
        </div>
    </div>
    <div class="row pb-2" v-if="isSpectatingDarkMode">
        <div class="col">
            <p class="mt-0 mb-0">This is a <strong>dark mode</strong> game, no stars will be visible to you unless you have been invited to spectate a player.</p>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import GameHelper from '../../../../services/gameHelper';

const store = useStore();

const isSpectating = computed(() => {
    return GameHelper.isUserSpectatingGame(store.state.game);
});

const isSpectatingDarkMode = computed(() => {
    return (GameHelper.isDarkMode(store.state.game) || GameHelper.isDarkFogged(store.state.game)) && !store.state.game.galaxy.stars.length;
});
</script>

<style scoped>
</style>
