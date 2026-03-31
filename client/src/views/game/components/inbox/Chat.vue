<template>
  <div class="d-none d-lg-block" v-if="isUserInGame && !isTutorialGame">
    <div id="toggle" class="text-center" :class="{'bg-success has-read': !unreadMessages, 'bg-warning has-unread pulse': unreadMessages}" @click="toggle" title="Inbox (M)">
      <span class="icon-text"><i class="fas fa-comments me-1"></i>{{unreadMessages ? unreadMessages : ''}}</span>
    </div>

    <div id="window" v-if="isExpanded" class="header-bar-bg">
      <conversation-list v-if="store.menuStateChat.state === 'inbox'"/>
      <conversation-create v-if="store.menuStateChat.state === 'createConversation'"
        :participantIds="store.menuStateChat.participantIds"
        @onCloseRequested="toggle"/>
      <conversation-detail v-if="store.menuStateChat.state === 'conversation'"
        :conversationId="store.menuStateChat.conversationId"
        @onCloseRequested="toggle"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onOpenReportPlayerRequested="onOpenReportPlayerRequested" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { eventBusInjectionKey } from '@/eventBus';
import KEYBOARD_SHORTCUTS from '../../../../services/data/keyboardShortcuts';
import GameHelper from '../../../../services/gameHelper';
import ConversationList from '../inbox/conversations/ConversationList.vue';
import ConversationCreate from './conversations/ConversationCreate.vue';
import ConversationDetail from './conversations/ConversationDetail.vue';
import { ref, inject, computed, onMounted, onUnmounted } from 'vue';
import MenuEventBusEventNames from '../../../../eventBusEventNames/menu';
import type {Game} from "@/types/game";
import { useUserStore } from '@/stores/user';

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
  onOpenReportPlayerRequested: [{ playerId: string, messageId: string, conversationId: string }],
}>();

const eventBus = inject(eventBusInjectionKey)!;

const store = useGameStore();
const userStore = useUserStore();

const onOpenPlayerDetailRequested = (e: string) => emit('onOpenPlayerDetailRequested', e);

const onOpenReportPlayerRequested = (e: { playerId: string, messageId: string, conversationId: string }) => emit('onOpenReportPlayerRequested', e);

const game = computed<Game>(() => store.game!);

const unreadMessages = computed<number | null>(() => store.unreadMessages);

const isUserInGame = computed(() => Boolean(GameHelper.getUserPlayer(game.value)));

const isTutorialGame = computed(() => GameHelper.isTutorialGame(game.value));

const isExpanded = ref(false);

const toggle = () => {
  isExpanded.value = !isExpanded.value;

  store.setMenuStateChat({ state: 'inbox' });
};

const canHandleConversationEvents = () => window.innerWidth >= 992;

const handleResize = () => {
  if (!isExpanded.value) { // Don't care about this if it is already collapsed
    return;
  }

  isExpanded.value = canHandleConversationEvents();
};

const onViewConversationRequested = (e: { conversationId: string, participantIds: string[] }) => {
  if (!canHandleConversationEvents()) {
    return;
  }

  if (e.conversationId) {
    store.setMenuStateChat({ state: "conversation", conversationId: e.conversationId });
  } else if (e.participantIds) {
    store.setMenuStateChat({
      state: "createConversation",
      participantIds: e.participantIds
    });
  }

  isExpanded.value = true;
};

const onCreateNewConversationRequested = (e: { participantIds?: string[] }) => {
  if (!canHandleConversationEvents()) {
    return;
  }

  store.setMenuStateChat({ state: 'createConversation', participantIds: e.participantIds || [] });

  isExpanded.value = true;
};

const onOpenInboxRequested = () => {
  if (!canHandleConversationEvents()) {
    return;
  }

  store.setMenuStateChat({ state: 'inbox' });

  isExpanded.value = true;
};

const handleKeyDown = (e: KeyboardEvent) => {
// Note: We only care about the INBOX key here.
  if (/^(?:input|textarea|select|button)$/i.test((e.target as HTMLElement)?.tagName)) {
    return;
  }

  const key = e.key

  // Check for modifier keys and ignore the keypress if there is one.
  if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
    return
  }

  const isLoggedIn = userStore.isLoggedIn;
  const isInGame = isUserInGame.value;

  if (!isLoggedIn || !isInGame) {
    return;
  }

  let menuState = KEYBOARD_SHORTCUTS.all[key]

  if (menuState === null && isExpanded.value) {
    return toggle();
  }

  menuState = KEYBOARD_SHORTCUTS.player[key];

  if (!menuState) {
    return;
  }

  // Special case for Inbox shortcut, only do this if the screen is large
  if (menuState !== "inbox" || !canHandleConversationEvents()) {
    return;
  }

  store.setMenuStateChat({ state: menuState });

  toggle()
};

document.addEventListener('keydown', handleKeyDown);
window.addEventListener('resize', handleResize);

onMounted(() => {
  store.setMenuStateChat({ state: 'inbox' });

  eventBus.on(MenuEventBusEventNames.OnMenuChatSidebarRequested, toggle);
  eventBus.on(MenuEventBusEventNames.OnCreateNewConversationRequested, onCreateNewConversationRequested);
  eventBus.on(MenuEventBusEventNames.OnViewConversationRequested, onViewConversationRequested);
  eventBus.on(MenuEventBusEventNames.OnOpenInboxRequested, onOpenInboxRequested);

  onUnmounted(() => {
    eventBus.off(MenuEventBusEventNames.OnMenuChatSidebarRequested, toggle);
    eventBus.off(MenuEventBusEventNames.OnCreateNewConversationRequested, onCreateNewConversationRequested);
    eventBus.off(MenuEventBusEventNames.OnViewConversationRequested, onViewConversationRequested);
    eventBus.off(MenuEventBusEventNames.OnOpenInboxRequested, onOpenInboxRequested);

    document.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('resize', handleResize);
  });
});
</script>

<style scoped>
#toggle {
  position: absolute;
  display: inline-table;
  right: 20px;
  bottom: 20px;
  height: 60px;
  width: 60px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1;
}

#window {
  position: absolute;
  right: 0px;
  bottom: 100px;
  width: 473px;
  top: 45px;
  overflow: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}

.icon-text {
  display: table-cell;
  vertical-align: middle;
}

.has-unread {
  font-size: 20px;
}

.has-read {
  font-size: 30px;
}

.pulse {
  animation: blinker 1.5s linear infinite;
}

@keyframes blinker {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
    transform: scale(1.1)
  }
  100% {
    opacity: 0.5;
  }
}
</style>
