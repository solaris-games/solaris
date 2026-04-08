<template>
  <p class="team-name" v-if="team">({{team.name}})</p>
</template>

<script setup lang="ts">
import GameHelper from '../../../../services/gameHelper';
import { computed } from 'vue';
import type { Game } from '@/types/game';
import {useGameStore} from "@/stores/game";

const props = defineProps<{
    playerId: string
}>()

const store = useGameStore();

const team = computed(() => {
    const game = store.game as Game;
    const player = GameHelper.getPlayerById(game, props.playerId);
    return GameHelper.getTeamByPlayer(game, player);
})
</script>

<style scoped>
.team-name {
  color: #4e9cff;
  font-size: 14px;
  margin-bottom: 0;
}
</style>
