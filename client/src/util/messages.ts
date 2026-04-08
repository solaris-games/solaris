import type {EventBus} from "../eventBus";
import { onMounted, onUnmounted, inject, computed } from "vue";
import type {ConversationMessageSentResult} from "@solaris-common";
import UserEventBusEventNames from "../eventBusEventNames/user";
import {useToast} from 'vue-toast-notification';
import {eventBusInjectionKey} from "../eventBus";
import router from "../router";
import {useUserStore} from "@/stores/user";
import {useGameStore} from "@/stores/game";

export const withMessages = () => {
  const $toast = useToast();
  const eventBus: EventBus = inject(eventBusInjectionKey)!;
  const gameStore = useGameStore();
  const userStore = useUserStore();

  const sendForAllGames = computed(() => userStore.user?.subscriptions?.inapp?.notificationsForOtherGames);

  const handler = (e: ConversationMessageSentResult<string>) => {
    const isInGame = gameStore.game?._id === e.gameId;

    if (!sendForAllGames.value && !isInGame) {
      return;
    }

    window?.solaris?.messages?.onConversationMessageReceived({
      gameID: e.gameId,
      gameName: e.gameName,
      fromPlayerId: e.fromPlayerId,
      fromPlayerAlias: e.fromPlayerAlias
    });

    if (isInGame) {
      $toast.info(`New message from ${e.fromPlayerAlias}.`, {
        duration: 10000,
        onClick: () => {
          gameStore.setMenuStateChat({ state: 'conversation', conversationId: e.conversationId });
        }
      });
    } else {
      const gameName = e.gameName;
      const text = gameName ? `In ${gameName}, you have received a message from ${e.fromPlayerAlias}.` : `In another game, you have received a message from ${e.fromPlayerAlias}.`;

      $toast.info(text, {
        duration: 10000,
        onClick: () => {
          router.replace({ name: 'game', query: { id: e.gameId } })
        }
      });
    }
  }

  onMounted(() => {
    eventBus.on(UserEventBusEventNames.GameMessageSent, handler)
  });

  onUnmounted(() => {
    eventBus.off(UserEventBusEventNames.GameMessageSent, handler)
  });
}
