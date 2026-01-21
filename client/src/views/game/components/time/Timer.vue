<template>
  <span>{{timeString}}</span>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import type {Game} from "@/types/game";
import GameHelper from "@/services/gameHelper";
import {getCountdownTimeStringByTicks, getCountdownTimeStringWithETA} from "@/util/time";

const props = defineProps<{
  ticks: number;
  showETA?: boolean;
}>();

const store = useStore();
const game = computed<Game>(() => store.state.game);

const timeString = ref('');

const recalculateTime = () => {
  if (props.showETA) {
    timeString.value = getCountdownTimeStringWithETA(game.value, props.ticks);
  } else {
    timeString.value = getCountdownTimeStringByTicks(game.value, props.ticks);
  }
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
