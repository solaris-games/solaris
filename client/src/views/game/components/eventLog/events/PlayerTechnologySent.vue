<template>
<div v-if="player">
  <p>
      You have sent <span class="text-warning">Level {{event.data.technology.level}} {{getTechnologyFriendlyName(event.data.technology.name)}}</span> to <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{player.alias}}</a>.
  </p>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import GameHelper from '../../../../../services/gameHelper';
import TechnologyHelper from '../../../../../services/technologyHelper';

import type {PlayerTechnologySentEvent, ResearchType} from "@solaris-common";
import type {Game} from "@/types/game";

const props = defineProps<{
  event: PlayerTechnologySentEvent<string>,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const onOpenPlayerDetailRequested = () => emit('onOpenPlayerDetailRequested', props.event.data.toPlayerId);

const store = useStore();
const game = computed<Game>(() => store.state.game);

const player = computed(() => GameHelper.getPlayerById(game.value, props.event.data.toPlayerId)!);

const getTechnologyFriendlyName = (key: string) => TechnologyHelper.getFriendlyName(key as ResearchType);
</script>

<style scoped>
</style>
