import { ref, readonly } from 'vue';
import { defineStore } from "pinia";

export const useConversationStore = defineStore('', () => {
  const cachedConversationComposeMessages = ref<Record<string, string>>({});
  const currentConversation = ref<{id: string, text: string} | null>(null);

  const openConversation = (id: string) => {
    currentConversation.value = {
      id,
      text: cachedConversationComposeMessages[id] || '',
    };
  };

  const closeConversation = () => {
    if (currentConversation.value) {
      const id = currentConversation.value.id;
      cachedConversationComposeMessages[id] = currentConversation.value.text;
      currentConversation.value = null;
    }
  };

  const updateCurrentConversationText = (text: string) => {
    currentConversation.value!.text = text;
  };

  const resetCurrentConversationText = () => {
    currentConversation.value!.text = '';
  };

  return {
    currentConversation: readonly(currentConversation),
    openConversation,
    closeConversation,
    updateCurrentConversationText,
    resetCurrentConversationText,
  };
});
