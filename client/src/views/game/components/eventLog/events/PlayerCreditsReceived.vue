<template>
<div v-if="player">
  <p>
      You have received <span class="text-warning">${{event.data.credits}} credits</span> from <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{player.alias}}</a>.
  </p>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import GameHelper from '../../../../../services/gameHelper';
import type {PlayerCreditsReceivedEvent} from "@solaris-common";
import { useStore } from 'vuex';

const props = defineProps<{
  event: PlayerCreditsReceivedEvent<string>,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const store = useStore();
const game = computed(() => store.state.game);

const player = computed(() => GameHelper.getPlayerById(game.value, props.event.data.fromPlayerId)!);

const onOpenPlayerDetailRequested = () => emit('onOpenPlayerDetailRequested', props.event.data.fromPlayerId);
</script>

<style scoped>
</style>
