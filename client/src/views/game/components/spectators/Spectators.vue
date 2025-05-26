<template>
<div class="menu-page container">
    <menu-title title="Spectators" @onCloseRequested="onCloseRequested"/>

    <loading-spinner :loading="isLoading"/>

    <div class="row text-center mt-2" v-if="!isLoading && !spectators.length">
      <p class="text-warning mb-1">This game has no spectators.</p>
    </div>

    <div class="row mt-2" v-if="!isLoading">
        <spectator v-for="s in spectators" :spectator="s" :key="s._id"
          @onSpectatorUninvited="loadSpectators"/>
    </div>

    <p class="text-info"><i>Spectators will view the game from the perspective of the players they are spectating. For more information, see the wiki.</i></p>

    <invite-spectator @onSpectatorsInvited="loadSpectators" class="pb-2"/>
</div>
</template>

<script setup lang="ts">
import MenuTitle from '../MenuTitle.vue'
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import InviteSpectator from './InviteSpectator.vue'
import Spectator from './Spectator.vue'
import {httpInjectionKey, isOk} from "@/services/typedapi";
import {inject, ref, onMounted, type Ref} from 'vue';
import {listSpectators} from "@/services/typedapi/spectator";
import type {State} from "@/store";
import {useStore, type Store} from 'vuex';
import type {GameSpectator} from "@solaris-common";

const store: Store<State> = useStore();
const httpClient = inject(httpInjectionKey)!;

const emit = defineEmits<{
  (e: 'onCloseRequested'): void
}>();

const isLoading = ref(false);
const spectators: Ref<GameSpectator<string>[]> = ref([]);

const onCloseRequested = e => {
  emit('onCloseRequested');
};

const loadSpectators = async () => {
  isLoading.value = true;

  const response = await listSpectators(httpClient)(store.state.game._id);

  if (isOk(response)) {
    spectators.value = response.data || [];
  } else {
    console.error('Failed to load spectators:', response);
  }

  isLoading.value = false;
};

onMounted(() => {
  loadSpectators();
});

</script>

<style scoped>
</style>
