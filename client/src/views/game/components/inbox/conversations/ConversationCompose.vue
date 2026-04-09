<template>
<form class="pb-1 conversation">
  <mention-box placeholder="Compose a message" :rows="3" v-model="conversationStore.currentConversation!.text" @onSetMessageElement="onSetMessageElement" @onReplaceInMessage="onReplaceInMessage" @onFinish="send"></mention-box>
  <div class="mb-2 text-end">
    <div class="d-grid gap-2">
      <button type="button" class="btn btn-success" @click="send" :disabled="isSendingMessage">
        <i class="fas fa-paper-plane"></i>
        Send Message
      </button>
    </div>
  </div>
</form>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import MentionHelper, {type Mention} from '../../../../../services/mentionHelper';
import AudioService from '../../../../../game/audio';
import MentionBox from '../../shared/MentionBox.vue';
import { inject, ref, computed } from 'vue';
import {httpInjectionKey, isOk} from "@/services/typedapi";
import type {Game, Player, Star} from "@/types/game";
import {sendMessage} from "@/services/typedapi/conversation";
import type {ConversationMessageSentResult} from "@solaris/common";
import {useMentionStore} from "@/stores/mention";
import {useConversationStore} from "@/stores/conversation.ts";

const props = defineProps<{
  conversationId: string,
}>();

const emit = defineEmits<{
  onConversationMessageSent: [res: ConversationMessageSentResult<string>],
}>();

const httpClient = inject(httpInjectionKey)!;

const store = useGameStore();
const conversationStore = useConversationStore();
const mentionStore = useMentionStore();
const game = computed<Game>(() => store.game!);

const isSendingMessage = ref(false);
const currentMention = ref<string | null>(null);

const onSetMessageElement = (element: HTMLTextAreaElement) => {
  mentionStore.setMentions({
    element,
    callbacks: {
      player: (player: Player) => {
        conversationStore.updateCurrentConversationText(MentionHelper.addMention(conversationStore.currentConversation!.text, mentionStore.mentionReceivingElement!, 'player', player.alias));
      },
      star: (star: Star) => {
        conversationStore.updateCurrentConversationText(MentionHelper.addMention(conversationStore.currentConversation!.text, mentionStore.mentionReceivingElement!, 'star', star.name));
      },
    },
  });
};

const onReplaceInMessage = (data: { mention: Mention, text: string }) => {
  conversationStore.updateCurrentConversationText(MentionHelper.useSuggestion(conversationStore.currentConversation!.text, mentionStore.mentionReceivingElement!, data));
};

const send = async () => {
  const messageText = conversationStore.currentConversation?.text;

  if (!messageText) {
    return;
  }

  const message = MentionHelper.makeMentionsStatic(game.value, messageText);

  isSendingMessage.value = true;

  const response = await sendMessage(httpClient)(game.value._id, props.conversationId, message);
  if (isOk(response)) {
    AudioService.type();

    emit('onConversationMessageSent', response.data);

    conversationStore.resetCurrentConversationText();
    currentMention.value = null;
  }

  isSendingMessage.value = false
};
</script>

<style scoped>
.conversation {
  position: relative;
}

.mention-overlay {
  position: absolute;
  z-index: 10;
  bottom: 100%;
  width: 100%;
  border-radius: 4px;
}

.mention-overlay ul {
  padding: 4px 8px;
  margin-bottom: 0;
}

.mention-overlay li {
  list-style-type: none;
  cursor: pointer;
}

.mention-overlay .selected {
  font-weight: bold;
}
</style>
