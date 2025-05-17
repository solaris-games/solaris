<template>
  <div class="row">
    <div class="col">
        <h5><i class="fas fa-user me-1"></i>{{spectator.username}}</h5>
        <ul>
            <li v-for="player in players" :key="player._id">
                <span>{{player.alias}}</span>
                <i class="fas fa-times text-danger ms-1 pointer" title="Remove spectator"
                    v-if="!isLoading && userPlayer && userPlayer._id === player._id"
                    @click="uninvite"></i>
                <i class="fas fa-sync ms-1" v-if="isLoading"/>
            </li>
        </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import GameHelper from '../../../../services/gameHelper'
import type {GameSpectator} from "@solaris-common";
import {uninviteSpectator} from "@/services/typedapi/spectator";
import type {State} from "@/store";
import {httpInjectionKey, isOk} from "@/services/typedapi";
import {useStore, type Store} from 'vuex';
import {ref, inject, computed} from 'vue';
import {toastInjectionKey} from "@/util/keys";

const props = defineProps<{
  spectator: GameSpectator<string>,
}>();

const emit = defineEmits<{
  (e: 'onSpectatorUninvited', spectator: GameSpectator<string>): void
}>();

const store: Store<State> = useStore();
const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const isLoading = ref(false);

const players = computed(() => {
  return store.state.game.galaxy.players.filter(p => props.spectator.playerIds.includes(p._id));
});

const userPlayer = computed(() => {
  return GameHelper.getUserPlayer(store.state.game);
});


const uninvite = async () => {
  isLoading.value = true;

  const response = await uninviteSpectator(httpClient)(store.state.game._id, props.spectator._id);

  if (isOk(response)) {
    toast.success(`You uninvited ${props.spectator.username} from spectating you in this game.`)
    emit('onSpectatorUninvited', props.spectator)
  }

  isLoading.value = false;
};
</script>

<style scoped>
.pointer {
    cursor: pointer;
}
</style>
