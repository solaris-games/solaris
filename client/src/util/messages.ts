import type {EventBus} from "../eventBus";
import { onMounted, onUnmounted, inject } from "vue";
import type {State} from "../store";
import { useStore, type Store } from 'vuex';
import type {ConversationMessageSentResult} from "@solaris-common";
import UserEventBusEventNames from "../eventBusEventNames/user";
import {useToast} from 'vue-toast-notification';
import {eventBusInjectionKey} from "../eventBus";
import MENU_STATES from '../services/data/menuStates';
import router from "../router";

export const withMessages = () => {
  const $toast = useToast();
  const eventBus: EventBus = inject(eventBusInjectionKey)!;
  const store: Store<State> = useStore();

  const handler = (e: ConversationMessageSentResult<string>) => {
    const isInGame = store.state.game?._id === e.gameId;

    if (isInGame) {
      $toast.info(`New message from ${e.fromPlayerAlias}.`, {
        duration: 10000,
        onClick: () => {
          store.commit('setMenuStateChat', {
            state: MENU_STATES.CONVERSATION,
            args: e.conversationId
          })
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
