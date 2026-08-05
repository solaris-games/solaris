<template>
  <div class="chat-ui" v-if="isUserInGame && !isTutorialGame">
    <div
      id="toggle"
      class="d-none d-lg-flex chat-toggle"
      :class="{
        'bg-success has-read': !unreadMessages,
        'bg-warning has-unread pulse': unreadMessages,
      }"
      @click="toggle"
      title="Inbox (M)"
    >
      <span
        ><i class="fas fa-comments me-1"></i
        >{{ unreadMessages ? unreadMessages : "" }}</span
      >
    </div>

    <div id="chat-window" v-if="isExpanded" class="header-bar-bg">
      <conversation-create
        v-if="store.menuStateChat.state === 'createConversation'"
        :participantIds="store.menuStateChat.participantIds"
        @onCloseRequested="toggle"
      />
      <conversation-detail
        v-if="store.menuStateChat.state === 'conversation'"
        :conversationId="store.menuStateChat.conversationId"
        @onCloseRequested="toggle"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onOpenReportPlayerRequested="onOpenReportPlayerRequested"
      />
      <inbox
        v-if="store.menuStateChat.state == 'inbox'"
        @onCloseRequested="toggle"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "@/stores/game";
import GameHelper from "../../../../services/gameHelper";
import ConversationCreate from "./conversations/ConversationCreate.vue";
import ConversationDetail from "./conversations/ConversationDetail.vue";
import { computed } from "vue";
import type { Game } from "@/types/game";
import { useUserStore } from "@/stores/user";
import Inbox from "@/views/game/components/inbox/Inbox.vue";

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string];
  onOpenReportPlayerRequested: [
    { playerId: string; messageId: string; conversationId: string },
  ];
}>();

const store = useGameStore();
const userStore = useUserStore();

const onOpenPlayerDetailRequested = (e: string) =>
  emit("onOpenPlayerDetailRequested", e);

const onOpenReportPlayerRequested = (e: {
  playerId: string;
  messageId: string;
  conversationId: string;
}) => emit("onOpenReportPlayerRequested", e);

const game = computed<Game>(() => store.game!);

const unreadMessages = computed<number | null>(() => store.unreadMessages);

const isUserInGame = computed(() =>
  Boolean(GameHelper.getUserPlayer(game.value)),
);

const isTutorialGame = computed(() => GameHelper.isTutorialGame(game.value));

const isExpanded = computed(() => store.menuStateChat.state !== "none");

const toggle = () => {
  if (store.menuStateChat.state === "none") {
    store.setMenuStateChat({ state: "inbox" });
  } else {
    store.setMenuStateChat(store.menuStateChat);
  }
};
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

#chat-window {
  max-height: min(1200px, 100dvh - 200px);
  width: min(600px, 100%);
  overflow: auto;
  scrollbar-width: none;
}

@media screen and (max-width: 576px) {
  #chat-window {
    max-height: min(1200px, 100dvh - 100px);
  }
}

.chat-ui {
  min-height: 0;
  max-height: 100%;
  grid-area: stacked-content;
  z-index: 100;
  pointer-events: none;
  min-width: 0;
  max-width: 100%;
  display: flex;
  flex-direction: row-reverse;

  * {
    pointer-events: auto;
  }
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

.chat-toggle {
  align-items: center;
  justify-content: center;
}

@keyframes blinker {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.5;
  }
}
</style>
