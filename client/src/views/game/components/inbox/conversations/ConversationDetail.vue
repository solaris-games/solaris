<template>
<div class="menu-page" ref="conversationDetail">
  <loading-spinner :loading="!conversation"/>

  <div class="container" v-if="conversation">
    <menu-title title="" class="menu-page-header pb-1 bg-dark" @onCloseRequested="onCloseRequested">
      <button class="btn btn-sm" v-if="conversation.createdBy" :class="{'btn-outline-default':!pinnedOnly, 'btn-success':pinnedOnly}" title="Show/Hide pinned messages" @click="togglePinnedOnly">
        <i class="fas fa-thumbtack"></i>
      </button>
      <button class="btn btn-sm ms-1" :class="{'btn-outline-success':!conversation.isMuted, 'btn-danger':conversation.isMuted}" title="Mute/Unmute conversation" @click="toggleMuteConversation">
        <i class="fas" :class="{'fa-bell-slash':conversation.isMuted,'fa-bell':!conversation.isMuted}"></i>
      </button>
      <button class="btn btn-sm btn-outline-info ms-1 d-lg-none" @click="toggleConversationWindow" title="Toggle conversation display">
        <i class="fas" :class="{'fa-eye-slash':!toggleDisplay,'fa-eye':toggleDisplay}"></i>
      </button>
      <button class="btn btn-sm btn-outline-primary ms-1" @click="onOpenInboxRequested" title="Back to Inbox"><i class="fas fa-inbox"></i></button>
      <button class="btn btn-sm btn-outline-warning ms-1" @click="leaveConversation" v-if="conversation.createdBy" title="Leave conversation"><i class="fas fa-sign-out-alt"></i></button>
    </menu-title>

    <h5 v-if="conversation && toggleDisplay" class="menu-page-header-padding mb-0">{{conversation.name}}</h5>

    <p v-if="!toggleDisplay" class="pb-0 mb-1 text-warning menu-page-header-padding">
      <small><i>Click the <i class="fas fa-eye-slash"></i> button to view the conversation.</i></small>
    </p>

    <conversation-participants v-if="toggleDisplay" :conversation="conversation" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>

    <div class="messages-container">
      <div class="pt-0 mb-2 mt-2" v-if="toggleDisplay && filteredMessages.length">
        <div v-for="message in filteredMessages" v-bind:key="message.sentDate.getTime().toString()" class="mb-1">
          <conversation-message v-if="message.type === 'message'" :conversation="conversation" :message="message as CMessage<string>"
            @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
            @onOpenReportPlayerRequested="onOpenReportPlayerRequested"
            @onMinimizeConversationRequested="toggleConversationWindow"/>
          <conversation-trade-event v-if="message.type !== 'message'" :event="message"/>
        </div>
      </div>
    </div>

    <div class="pt-0 mb-2 mt-2" v-if="toggleDisplay && !filteredMessages.length">
        <p class="mb-0 text-center">No messages.</p>
    </div>

    <compose-message class="compose-message" v-if="toggleDisplay" :conversationId="conversationId" @onConversationMessageSent="onConversationMessageSent" />
  </div>
</div>
</template>

<script setup lang="ts">
import GameHelper from '../../../../../services/gameHelper'
import LoadingSpinner from '../../../../components/LoadingSpinner.vue'
import MenuTitle from '../../MenuTitle.vue'
import ConversationParticipants from './ConversationParticipants.vue'
import ComposeMessage from './ConversationCompose.vue'
import ConversationMessage from './ConversationMessage.vue'
import ConversationTradeEvent from './ConversationTradeEvent.vue'
import { inject, ref, computed, onMounted, onUnmounted, useTemplateRef } from 'vue'
import { eventBusInjectionKey } from '../../../../../eventBus'
import PlayerEventBusEventNames from '../../../../../eventBusEventNames/player'
import MenuEventBusEventNames from '../../../../../eventBusEventNames/menu'
import UserEventBusEventNames from "../../../../../eventBusEventNames/user";
import {formatError, httpInjectionKey, isError, isOk} from "@/services/typedapi";
import { useStore } from 'vuex';
import {detailConversation, leave, markAsRead, mute, unmute} from "@/services/typedapi/conversation";
import {makeConfirm} from "@/util/confirm";
import type { Conversation, ConversationMessageSentResult, ConversationMessage as CMessage } from "@solaris-common";
import type { Game } from "@/types/game";

const props = defineProps<{
  conversationId: string,
}>();

const emit = defineEmits<{
  onCloseRequested: [],
  onOpenReportPlayerRequested: [{ playerId: string, messageId: string, conversationId: string }],
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const confirm = makeConfirm(store);
const game = computed<Game>(() => store.state.game);

const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));

const conversation = ref<Conversation<string> | null>(null);
const toggleDisplay = ref(true);
const pinnedOnly = ref(false);

const element = useTemplateRef("conversationDetail");

const filteredMessages = computed(() => {
  if (!conversation.value) {
    return [];
  }

  const messages = conversation.value.messages;

  if (!pinnedOnly.value) {
    return messages;
  } else {
    return messages.filter(m => m.type === 'message' && (m as CMessage<string>).pinned);
  }
});

const onOpenPlayerDetailRequested = (e: string) => emit('onOpenPlayerDetailRequested', e);

const onOpenReportPlayerRequested = (e: { playerId: string, messageId: string, conversationId: string }) => emit('onOpenReportPlayerRequested', e);

const onCloseRequested = () => emit('onCloseRequested');

const onOpenInboxRequested = () => eventBus.emit(MenuEventBusEventNames.OnOpenInboxRequested);

const toggleConversationWindow = () => {
  toggleDisplay.value = !toggleDisplay.value;
};

const markConversationAsRead = async () => {
  const response = await markAsRead(httpClient)(game.value._id, conversation.value!._id);
  if (isError(response)) {
    console.error(formatError(response));
  }
};

const scrollToEnd = () => {
  // This doesn't seem to work inline, have to wait 100ms so that the UI can update itself
  // before scrolling the div container to the bottom.
  setTimeout(async () => {
    if (!element.value) {
      return;
    }

    if (conversation.value && conversation.value.messages.length) {
      if (window.innerWidth >= 992) {
        const el = element.value.getElementsByClassName('compose-message')[0];

        if (el) {
          el.scrollIntoView();
        }
      } else {
        const el = element.value.querySelector('.messages-container')!;
        el.scrollTop = el.scrollHeight;
      }

      await markConversationAsRead();
    }
  }, 100);
};

const loadConversation = async () => {
  conversation.value = null;

  const response = await detailConversation(httpClient)(game.value._id, props.conversationId);
  if (isOk(response)) {
    conversation.value = response.data;

    store.commit('openConversation', props.conversationId);

    scrollToEnd();

  } else {
    console.error(formatError(response));
  }
};

const leaveConversation = async () => {
  if (await confirm('Leave conversation', `Are you sure you want to leave this conversation?`)) {
    const response = await leave(httpClient)(game.value._id, props.conversationId);
    if (isOk(response)) {
      onOpenInboxRequested();
    } else {
      console.error(formatError(response));
    }
  }
};

const toggleMuteConversation = async () => {
  if (!conversation.value) {
    return;
  }

  let response;

  if (conversation.value.isMuted) {
    response = await unmute(httpClient)(game.value._id, conversation.value!._id);
  } else {
    response = await mute(httpClient)(game.value._id, conversation.value!._id);
  }

  if (isOk(response)) {
    conversation.value.isMuted = !conversation.value.isMuted;
  } else {
    console.error(formatError(response));
  }
};

const onMessageReceived = (e: ConversationMessageSentResult<string>) => {
  if (e.conversationId === conversation.value!._id) {
    conversation.value!.messages.push(e);
    scrollToEnd();
  }
};

const onConversationRead = (e: { conversationId: string, readByPlayerId: string }) => {
  if (e.conversationId === conversation.value!._id) {
    const messages = conversation.value!.messages.filter(m => m.type === 'message');

    for (let message of messages) {
      if (message.type === 'message') {
        const msg = message as CMessage<string>;

        if (msg.readBy.indexOf(e.readByPlayerId) < 0) {
          msg.readBy.push(e.readByPlayerId);
        }
      }
    }
  }
};

const onConversationMessageUnpinned = (e: { conversationId: string, messageId: string }) => {
  if (e.conversationId === conversation.value!._id) {
    const message = conversation.value!.messages.find(m => m.type === 'message' && (m as CMessage<string>)._id === e.messageId);

    if (message) {
      (message as CMessage<string>).pinned = false;
    }
  }
};

const onTradeEventReceived = (e: { playerId: string, type: string, date: Date, data: { fromPlayerId: string, toPlayerId: string } }) => {
  if (conversation.value!.participants.length !== 2) {
    return;
  }

  const partnerPlayerId = conversation.value!.participants.filter(p => p !== userPlayer.value!._id)[0];

  const isTradeEventBetweenPlayers = (e.playerId === userPlayer.value!._id && e.data.fromPlayerId === partnerPlayerId) ||
    (e.playerId === partnerPlayerId && e.data.fromPlayerId === userPlayer.value!._id) ||
    (e.playerId === userPlayer.value!._id && e.data.toPlayerId === partnerPlayerId) ||
    (e.playerId === partnerPlayerId && e.data.toPlayerId === userPlayer.value!._id);

  if (isTradeEventBetweenPlayers) {
    conversation.value!.messages.push({
      ...e,
      sentDate: e.date,
      sentTick: game.value.state.tick,
    });

    scrollToEnd();
  }
};

const onConversationMessagePinned = (e: { conversationId: string, messageId: string }) => {
  if (e.conversationId === conversation.value!._id) {
    const message = conversation.value!.messages.find(m => m.type === 'message' && ((m as CMessage<string>)._id === e.messageId));

    if (message && message.type === 'message') {
      (message as CMessage<string>).pinned = true;
    }
  }
};

const onConversationLeft = (e: { conversationId: string, playerId: string }) => {
  if (e.conversationId === conversation.value!._id) {
    conversation.value!.participants.splice(conversation.value!.participants.indexOf(e.playerId), 1);
  }
};

const onConversationMessageSent = (e: ConversationMessageSentResult<string>) => {
  conversation.value!.messages.push(e);
  scrollToEnd();
};

const togglePinnedOnly = () => {
  pinnedOnly.value = !pinnedOnly.value;
  scrollToEnd();
};

onMounted(async () => {
  onUnmounted(() => {
    eventBus.off(UserEventBusEventNames.GameMessageSent, onMessageReceived);
    eventBus.off(PlayerEventBusEventNames.GameConversationRead, onConversationRead);
    eventBus.off(PlayerEventBusEventNames.GameConversationLeft, onConversationLeft);
    eventBus.off(PlayerEventBusEventNames.GameConversationMessagePinned, onConversationMessagePinned);
    eventBus.off(PlayerEventBusEventNames.GameConversationMessageUnpinned, onConversationMessageUnpinned);
    eventBus.off(PlayerEventBusEventNames.PlayerCreditsReceived, onTradeEventReceived);
    eventBus.off(PlayerEventBusEventNames.PlayerCreditsSpecialistsReceived, onTradeEventReceived);
    eventBus.off(PlayerEventBusEventNames.PlayerRenownReceived, onTradeEventReceived);
    eventBus.off(PlayerEventBusEventNames.PlayerTechnologyReceived, onTradeEventReceived);

    store.commit('resetMentions');
    store.commit('closeConversation');
  });

  eventBus.on(UserEventBusEventNames.GameMessageSent, onMessageReceived);
  eventBus.on(PlayerEventBusEventNames.GameConversationRead, onConversationRead);
  eventBus.on(PlayerEventBusEventNames.GameConversationLeft, onConversationLeft);
  eventBus.on(PlayerEventBusEventNames.GameConversationMessagePinned, onConversationMessagePinned);
  eventBus.on(PlayerEventBusEventNames.GameConversationMessageUnpinned, onConversationMessageUnpinned);
  eventBus.on(PlayerEventBusEventNames.PlayerCreditsReceived, onTradeEventReceived);
  eventBus.on(PlayerEventBusEventNames.PlayerCreditsSpecialistsReceived, onTradeEventReceived);
  eventBus.on(PlayerEventBusEventNames.PlayerRenownReceived, onTradeEventReceived);
  eventBus.on(PlayerEventBusEventNames.PlayerTechnologyReceived, onTradeEventReceived);

  await loadConversation();
});
</script>

<style scoped>
@media screen and (max-width: 992px) {
  .messages-container {
    max-height: 500px;
    overflow: auto;
  }
}
@media screen and (min-width: 992px) {
  .menu-page-header {
    position: fixed;
    z-index: 1;
    width: 456px;
  }

  .menu-page-header-padding {
    padding-top: 48px;
  }
}
</style>
