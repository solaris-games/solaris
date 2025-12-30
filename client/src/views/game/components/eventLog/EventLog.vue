<template>
<div class="menu-page">
  <div class="container">
    <menu-title title="Event Log" @onCloseRequested="onCloseRequested"/>
  </div>

  <events-list class="pt-2" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
</div>
</template>

<script setup lang="ts">
import MenuTitle from '../MenuTitle.vue';
import EventsList from './events/EventsList.vue';
import { inject, ref, computed, onMounted, onUnmounted } from 'vue';
import { eventBusInjectionKey } from '@/eventBus';
import PlayerEventBusEventNames from '../../../../eventBusEventNames/player';
import { useStore } from 'vuex';
import type {Game} from "@/types/game";
import {unreadCount} from "@/services/typedapi/event";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";

const emit = defineEmits<{
  onCloseRequested: [],
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);

const unreadEvents = ref(0);

const onCloseRequested = () => emit('onCloseRequested');

const onOpenPlayerDetailRequested = (playerId: string) => emit('onOpenPlayerDetailRequested', playerId);

const checkForUnreadEvents = async () => {
  const response = await unreadCount(httpClient)(game.value._id);
  if (isOk(response)) {
    unreadEvents.value = response.data.unread;
  } else {
    console.error(formatError(response));
  }
};

onMounted(async () => {
  eventBus.on(PlayerEventBusEventNames.PlayerEventRead, checkForUnreadEvents);
  eventBus.on(PlayerEventBusEventNames.PlayerAllEventsRead, checkForUnreadEvents);

  onUnmounted(() => {
    eventBus.off(PlayerEventBusEventNames.PlayerEventRead, checkForUnreadEvents);
    eventBus.off(PlayerEventBusEventNames.PlayerAllEventsRead, checkForUnreadEvents);
  });

  await checkForUnreadEvents();
});
</script>

<style scoped>
</style>
