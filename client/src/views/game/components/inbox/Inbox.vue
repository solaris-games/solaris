<template>
<div class="menu-page">
  <div class="container">
      <menu-title title="Inbox" @onCloseRequested="onCloseRequested"/>
  </div>

  <conversation-list class="pt-2" />
</div>
</template>

<script setup lang="ts">
import MenuTitle from '../MenuTitle.vue';
import ConversationList from './conversations/ConversationList.vue';
import PlayerEventBusEventNames from '../../../../eventBusEventNames/player';
import { inject, ref, computed, onMounted, onUnmounted } from 'vue';
import { eventBusInjectionKey } from '../../../../eventBus';
import UserEventBusEventNames from "@/eventBusEventNames/user";
import { useStore } from 'vuex';
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import type {Game} from "@/types/game";
import {getUnreadCount} from "@/services/typedapi/conversation";

const emit = defineEmits<{
  onCloseRequested: [],
}>();

const store = useStore();
const game = computed<Game>(() => store.state.game);

const unreadMessages = ref(0);

const httpClient = inject(httpInjectionKey)!;
const eventBus = inject(eventBusInjectionKey)!;

const onCloseRequested = () => emit('onCloseRequested');

const checkForUnreadMessages = async () => {
  const response = await getUnreadCount(httpClient)(game.value._id);

  if (isOk(response)) {
    unreadMessages.value = response.data.unread;
  } else {
    console.error(formatError(response));
  }
};

onMounted(async () => {
  eventBus.on(UserEventBusEventNames.GameMessageSent, checkForUnreadMessages);
  eventBus.on(PlayerEventBusEventNames.GameConversationRead, checkForUnreadMessages);

  onUnmounted(() => {
    eventBus.off(UserEventBusEventNames.GameMessageSent, checkForUnreadMessages);
    eventBus.off(PlayerEventBusEventNames.GameConversationRead, checkForUnreadMessages);
  });

  await checkForUnreadMessages();
});
</script>

<style scoped>
</style>
