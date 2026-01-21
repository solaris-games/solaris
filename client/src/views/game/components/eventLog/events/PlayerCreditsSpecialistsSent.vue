<template>
<div v-if="player">
  <p>
      You have sent <span class="text-warning">{{event.data.creditsSpecialists}} specialist token(s)</span> to <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{player.alias}}</a>.
  </p>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import GameHelper from '../../../../../services/gameHelper'
import type {PlayerSpecialistTokensSentEvent} from "@solaris-common";
import type {Game} from "@/types/game";

const props = defineProps<{
  event: PlayerSpecialistTokensSentEvent<string>,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const onOpenPlayerDetailRequested = () => emit('onOpenPlayerDetailRequested', props.event.data.toPlayerId);

const store = useStore();
const game = computed<Game>(() => store.state.game);

const player = computed(() => GameHelper.getPlayerById(game.value, props.event.data.toPlayerId)!)
</script>

<style scoped>
</style>
