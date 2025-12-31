<template>
<div v-if="player">
  <p>
      You have received <span class="text-warning">{{event.data.creditsSpecialists}} specialist token(s)</span> from <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{player.alias}}</a>.
  </p>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import GameHelper from '../../../../../services/gameHelper';
import type {PlayerSpecialistTokensReceivedEvent} from "@solaris-common";
import type {Game} from "@/types/game";

const props = defineProps<{
  event: PlayerSpecialistTokensReceivedEvent<string>,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const onOpenPlayerDetailRequested = () => emit('onOpenPlayerDetailRequested', props.event.data.fromPlayerId);

const store = useStore();
const game = computed<Game>(() => store.state.game);

const player = computed(() => GameHelper.getPlayerById(game.value, props.event.data.fromPlayerId)!)
</script>

<style scoped>
</style>
