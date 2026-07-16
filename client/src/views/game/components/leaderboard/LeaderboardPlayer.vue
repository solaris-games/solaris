<template>
  <td
    :style="{
      width: '8px',
      'background-color': playerColourSpec.value,
    }"
  ></td>
  <td class="col-avatar" :title="playerColourSpec.alias + ' ' + player.shape">
    <player-avatar
      :player="player"
      @onClick="emit('onOpenPlayerDetailRequested', player._id)"
    />
  </td>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PlayerAvatar from "@/views/game/components/menu/PlayerAvatar.vue";
import type { Player } from "@/types/game.ts";
import { useGameStore } from "@/stores/game.ts";
import { useColourStore } from "@/stores/colour.ts";

const props = defineProps<{
  player: Player;
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string];
}>();

const colourStore = useColourStore();
const store = useGameStore();

const playerColourSpec = computed(() => {
  return colourStore.getColourForPlayer(store.game!, props.player._id)!;
});
</script>

<style scoped>
.col-avatar {
  cursor: pointer;
}
</style>
