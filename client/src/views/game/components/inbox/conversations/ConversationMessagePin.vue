<template>
  <span class="pointer thumbtack" @click="togglePinned">
    <i class="fas fa-thumbtack"></i>
  </span>
</template>

<script setup lang="ts">
import { inject, computed } from "vue";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import { useStore } from "vuex";
import {pinMessage, unpinMessage} from "@/services/typedapi/conversation";
import type {Game} from "@/types/game";

const props = defineProps<{
  conversationId: string,
  messageId: string,
  pinned: boolean,
}>();

const emit = defineEmits<{
  onPinned: [],
  onUnpinned: [],
}>();

const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);

const togglePinned = async () => {
  if (props.pinned) {
    const response = await unpinMessage(httpClient)(game.value._id, props.conversationId, props.messageId);
    if (isOk(response)) {
      emit("onUnpinned");
    } else {
      console.error(formatError(response));
    }
  } else {
    const response = await pinMessage(httpClient)(game.value._id, props.conversationId, props.messageId);
    if (isOk(response)) {
      emit("onPinned");
    } else {
      console.error(formatError(response));
    }
  }
};
</script>

<style scoped>
</style>
