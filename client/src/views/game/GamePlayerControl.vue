<template>
  <loading-spinner :loading="!game"/>

  <div v-if="game">
    <table class="table table-striped table-hover">
      <tbody>
      <tr v-for="player of filledSlots">
        <td>{{ player.alias }}</td>
        <td>
          <button class="btn btn-warning" @click="kickPlayer(player)"><i class="fas fa-hammer"></i> Kick</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '../components/LoadingSpinner.vue'
import type { GameGalaxyDetail, Player } from '@solaris-common';
import { computed, inject } from 'vue';
import { extractErrors, formatError, httpInjectionKey, isOk } from '@/services/typedapi';
import { toastInjectionKey } from '@/util/keys';
import { useStore } from 'vuex';
import { makeConfirm } from '@/util/confirm';
import { kick } from '@/services/typedapi/game';

const props = defineProps<{
  game: GameGalaxyDetail<string>,
}>();

const emit = defineEmits<{
  onGameModified: [],
}>();

const store = useStore();
const confirm = makeConfirm(store);

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const filledSlots = computed(() => props.game.galaxy.players.filter(p => !p.isOpenSlot));

const kickPlayer = async (player: Player<string>) => {
  if (await confirm(`Kick Player`, `Do you really want to kick player ${player.alias}?`)) {
    const response = await kick(httpClient)(props.game._id, player._id);

    if (isOk(response)) {
      toast.info('Player kicked');
    } else {
      console.error(formatError(response));
      toast.error(`Failed to kick player: ${extractErrors(response).join(", ")}`);
    }
  }
};
</script>
<style scoped>
</style>
