<template>
<form class="pb-1 conversation">
  <mention-box placeholder="Compose a message" :rows="3" v-model="store.state.currentConversation.text" @onSetMessageElement="onSetMessageElement" @onReplaceInMessage="onReplaceInMessage" @onFinish="send"></mention-box>
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
import MentionHelper, {type Mention} from '../../../../../services/mentionHelper';
import AudioService from '../../../../../game/audio';
import MentionBox from '../../shared/MentionBox.vue';
import { inject, ref, computed } from 'vue';
import {httpInjectionKey, isOk} from "@/services/typedapi";
import { useStore } from 'vuex';
import type {Game, Player, Star} from "@/types/game";
import {sendMessage} from "@/services/typedapi/conversation";
import type {ConversationMessageSentResult} from "@solaris-common";

const props = defineProps<{
  conversationId: string,
}>();

const emit = defineEmits<{
  onConversationMessageSent: [res: ConversationMessageSentResult<string>],
}>();

const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);

const isSendingMessage = ref(false);
const currentMention = ref<string | null>(null);
const selectedSuggestion = ref<string | null>(null);

const onSetMessageElement = (element: HTMLElement) => {
  store.commit('setMentions', {
    element,
    callbacks: {
      player: (player: Player) => {
        store.commit('updateCurrentConversationText', MentionHelper.addMention(store.state.currentConversation.text, store.state.mentionReceivingElement, 'player', player.alias))
      },
      star: (star: Star) => {
        store.commit('updateCurrentConversationText', MentionHelper.addMention(store.state.currentConversation.text, store.state.mentionReceivingElement, 'star', star.name))
      }
    }
  });
};

const onReplaceInMessage = (data: { mention: Mention, text: string }) => {
  store.commit('updateCurrentConversationText', MentionHelper.useSuggestion(store.state.currentConversation.text, store.state.mentionReceivingElement, data))
};

const send = async () => {
  let messageText = '';

  if (store.state.currentConversation) {
    messageText = store.state.currentConversation.text;

    if (!messageText) {
      return;
    }
  }

  const message = MentionHelper.makeMentionsStatic(game.value, messageText);

  isSendingMessage.value = true;

  const response = await sendMessage(httpClient)(game.value._id, props.conversationId, message);
  if (isOk(response)) {
    AudioService.type();

    emit('onConversationMessageSent', response.data);

    store.commit('resetCurrentConversationText');
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
