<template>
  <span>{{timeString}}</span>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import type {Game} from "@/types/game";
import GameHelper from "@/services/gameHelper";
import {getCountdownTimeStringByTicks} from "@/util/time";

const props = defineProps<{
  ticks: number;
}>();

const store = useStore();
const game = computed<Game>(() => store.state.game);

const timeString = ref('');

const recalculateTime = () => {
  timeString.value = getCountdownTimeStringByTicks(game.value, props.ticks);
};

onMounted(() => {
  let handler: number | undefined = undefined;

  if (GameHelper.isGameInProgress(game.value) || GameHelper.isGamePendingStart(game.value)) {
    handler = setInterval(recalculateTime, 1000);
  }

  recalculateTime();

  onUnmounted(() => {
    handler && clearInterval(handler);
  });
});
</script>

<style scoped>

</style>
