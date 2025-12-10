<template>
<div class="container pb-2">
  <loading-spinner :loading="!conversations"/>

  <div v-if="conversations">
    <div class="row">
      <div class="col">
        <button class="btn btn-sm btn-outline-primary" @click="onRefreshClicked"><i class="fas fa-sync"></i> Refresh</button>
      </div>
      <div class="col-auto" v-if="canCreateConversation">
        <button class="btn btn-sm btn-info ms-1" @click="onCreateNewConversationRequested">
          <i class="fas fa-comments"></i>
          Create...
        </button>
      </div>
    </div>

    <div class="text-center pt-2" v-if="!conversations.length">
        No Conversations.
    </div>

    <div class="pt-2">
        <conversation-preview
          v-for="conversation in orderedConversations"
          v-bind:key="conversation._id"
          :conversation="conversation"
          :isTruncated="true"
          :isFullWidth="true"
          class="mb-2"/>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { eventBusInjectionKey } from '../../../../../eventBus';
import LoadingSpinner from '../../../../components/LoadingSpinner.vue';
import ConversationPreview from './ConversationPreview.vue';
import gameHelper from '../../../../../services/gameHelper';
import { ref, computed, inject, onMounted, onUnmounted } from 'vue';
import MenuEventBusEventNames from '../../../../../eventBusEventNames/menu';
import UserEventBusEventNames from "../../../../../eventBusEventNames/user";
import {type ConversationMessageSentResult, type ConversationOverview} from "@solaris-common";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import { useStore } from 'vuex';
import type {Game} from "@/types/game";
import {listConversations} from "@/services/typedapi/conversation";

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);

const canCreateConversation = computed(() => game.value.settings.general.playerLimit > 2 && !gameHelper.isTutorialGame(game.value));

const conversations = ref<ConversationOverview<string>[]>([]);

const orderedConversations = computed(() => {
  return conversations.value.sort((a, b) => {
    if (a === b) {
      return 0;
    }
    else if (a.lastMessage === null) {
      return 1;
    }
    else if (b.lastMessage === null) {
      return -1;
    }
    else {
      return b.lastMessage.sentDate.getTime() - a.lastMessage.sentDate.getTime();
    }
  });
});

const refreshList = async () => {
  conversations.value = [];

  const response = await listConversations(httpClient)(game.value._id);
  if (isOk(response)) {
    conversations.value = response.data;
  } else {
    console.error(formatError(response));
  }
};

const onRefreshClicked = refreshList;

const onMessageReceived = (e: ConversationMessageSentResult<string>) => {
  // Find the conversation that this message is for and replace the last message.
  const convo = conversations.value.find(c => c._id === e.conversationId);

  if (!convo) {
    return;
  }

  convo.lastMessage = e;
  convo.unreadCount++;
};

const onCreateNewConversationRequested = () => eventBus.emit(MenuEventBusEventNames.OnCreateNewConversationRequested, {});

onMounted(() => {
  eventBus.on(UserEventBusEventNames.GameMessageSent, onMessageReceived);

  onUnmounted(() => {
    eventBus.off(UserEventBusEventNames.GameMessageSent, onMessageReceived);
  });

  refreshList();
});
</script>

<style scoped>
</style>
