<template>
<div class="participant-container">
  <p v-if="isPartialPlayers" class="mb-2">
    <small>
      <span v-for="participant in conversation.participants" :key="participant" class="me-2 pointer" @click="onOpenPlayerDetailRequested(participant)">
        <player-icon :playerId="getPlayer(participant)._id" class="me-1"/>

        {{getPlayer(participant).alias}}
      </span>
    </small>
  </p>
  <div v-if="!isPartialPlayers && !isOneVsOne" class="text-info mb-1">
    <p class="mb-0 mt-1">
      <i>This conversation is for <strong>all</strong> players.</i>
    </p>
    <p>
      <router-link :to="{ name: 'guidelines' }">Community Guidelines</router-link>
    </p>
  </div>
</div>
</template>

<script setup lang="ts">
import GameHelper from '../../../../../services/gameHelper';
import PlayerIcon from '../../player/PlayerIcon.vue';
import type {Conversation} from "@solaris-common";
import { computed } from 'vue';
import type {Game} from "@/types/game";
import { useStore } from "vuex";

const props = defineProps<{
  conversation: Conversation<string>,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const store = useStore();
const game = computed<Game>(() => store.state.game);

const isPartialPlayers = computed(() => props.conversation.participants.length !== game.value.galaxy.players.length);
const isOneVsOne = computed(() => game.value.settings.general.playerLimit === 2);

const onOpenPlayerDetailRequested = (playerId: string) => emit('onOpenPlayerDetailRequested', playerId);

const getPlayer = (playerId: string) => GameHelper.getPlayerById(game.value, playerId)!;
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
