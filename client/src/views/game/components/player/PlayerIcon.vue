<template>
  <span v-if="player" class="span-container" :title="onlineStatus">
    <player-icon-shape :filled="iconFilled" :iconColour="iconColour" :shape="player.shape" />
  </span>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import GameHelper from '../../../../services/gameHelper'
import PlayerIconShape from './PlayerIconShape.vue'
import type {Game} from "@/types/game";
import { useColourStore } from '@/stores/colour';

const props = defineProps<{
  playerId: string,
  hideOnlineStatus?: boolean,
  solidGlyphOnly?: boolean,
  colour?: string,
}>();

const store = useGameStore();
const colourStore = useColourStore();
const game = computed<Game>(() => store.game!);

const isOnline = ref(false);
const onlineStatus = ref('');

const player = computed(() => GameHelper.getPlayerById(game.value, props.playerId)!);

const playerColour = computed(() => colourStore.getColourForPlayer(game.value, props.playerId)!.value);
const iconColour = computed(() => !props.colour ? GameHelper.getFriendlyColour(playerColour.value) : props.colour);
const iconFilled = computed(() => {
  const unknownStatus = player.value.isOnline == null;
  return unknownStatus || isOnline.value || props.solidGlyphOnly;
});

const recalculateOnlineStatus = () => {
  isOnline.value = GameHelper.isPlayerOnline(player.value);
  onlineStatus.value = GameHelper.getOnlineStatus(player.value);
};

onMounted(() => {
  const intervalHandle = setInterval(recalculateOnlineStatus, 1000);
  recalculateOnlineStatus();

  onUnmounted(() => {
    clearInterval(intervalHandle);
  });
});
</script>

<style scoped>
.span-container {
  display: inline-block;
  height: 18px;
  width: 18px;
  margin-top: -12px;
  margin-right: -6px;
}

@media screen and (max-width: 576px) {
  .span-container {
    height: 10px;
    width: 10px;
    margin-top: -12px;
    margin-right: -6px;
  }
}
</style>
