<template>
  <div class="bg-warning p-1" v-if="isSpectating">
    <div class="row">
      <div class="col">
        <p class="mt-0 mb-0">You are spectating this game.</p>
      </div>
    </div>
    <div class="row" v-if="isSpectatingDarkMode">
      <div class="col">
        <p class="mt-0 mb-0">
          This is a <strong>dark mode</strong> game, no stars will be visible to
          you unless you have been invited to spectate a player.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "@/stores/game";
import { computed } from "vue";
import GameHelper from "../../../../services/gameHelper";

const store = useGameStore();

const isSpectating = computed(() => {
  return GameHelper.isUserSpectatingGame(store.game);
});

const isSpectatingDarkMode = computed(() => {
  return (
    (GameHelper.isDarkMode(store.game) ||
      GameHelper.isDarkFogged(store.game)) &&
    !store.game!.galaxy.stars.length
  );
});
</script>

<style scoped></style>
