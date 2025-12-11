<template>
  <div class="col-auto" v-if="message.fromPlayerId && !isFromUserPlayer">
    <div class="dropdown-container">
      <button class="btn btn-sm" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <i class="fas fa-ellipsis"></i>
      </button>
      <div class="dropdown-menu dropdown-menu-right">
        <button class="btn btn-small dropdown-item" @click="onViewConversationRequested(message.fromPlayerId)"
                v-if="conversation.participants.length > 2 && canCreateConversation">Direct Message</button>
        <button class="btn btn-small dropdown-item" @click="reportMessage">Report</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import gameHelper from "../../../../../services/gameHelper";
import { inject, computed } from "vue";
import { eventBusInjectionKey } from "../../../../../eventBus";
import MenuEventBusEventNames from "../../../../../eventBusEventNames/menu";
import type {ConversationMessage, Conversation} from "@solaris-common";
import type {Game, Player} from "@/types/game";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import { useStore } from "vuex";
import {listPrivate} from "@/services/typedapi/conversation";

const props = defineProps<{
  message: ConversationMessage<string>,
  conversation: Conversation<string>,
  userPlayer: Player,
}>();

const emit = defineEmits<{
  onOpenReportPlayerRequested: [{ playerId: string, messageId: string, conversationId: string }],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);

const canCreateConversation = computed(() => game.value.settings.general.playerLimit > 2 && !gameHelper.isTutorialGame(game.value));
const isFromUserPlayer = computed(() => props.message.fromPlayerId === props.userPlayer._id);

const loadConversation = async (playerId: string) => {
  if (props.userPlayer && props.userPlayer._id !== playerId) {
    const response = await listPrivate(httpClient)(game.value._id, playerId);
    if (isOk(response)) {
      return response.data;
    } else {
      console.error(formatError(response));
    }
  }

  return null;
};

const reportMessage = () => {
  emit('onOpenReportPlayerRequested', {
    playerId: props.message.fromPlayerId!,
    messageId: props.message._id!,
    conversationId: props.conversation._id,
  })
};

const onViewConversationRequested = async (playerId: string) => {
  const conversation = await loadConversation(playerId);

  if (conversation) {
    eventBus.emit(MenuEventBusEventNames.OnViewConversationRequested, {
      conversationId: conversation._id,
    });
  } else {
    // todo: select participants
    eventBus.emit(MenuEventBusEventNames.OnCreateNewConversationRequested, {});
  }
};
</script>

<style scoped>

</style>
