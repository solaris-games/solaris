<template>
  <div class="mention-box">
    <div class="mention-overlay bg-dark mb-1" v-if="suggestMentions && currentMention && currentMention.suggestions && currentMention.suggestions.length">
      <ul>
        <li v-for="(suggestion, index) in currentMention.suggestions" :class="{ selected: index === selectedSuggestion }" :key="suggestion" @click="() => useSuggestion(suggestion)">{{suggestion}}</li>
      </ul>
    </div>
    <div class="mb-2 mb-2">
      <textarea class="form-control" id="txtMessage" :rows="rows" :placeholder="placeholderText" ref="messageElement" :value="modelValue" @input="onMessageChange" @keydown="onKeyDown" @keyup="updateSuggestions" @select="updateSuggestions" @focus="onFocus"></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted, useTemplateRef, watch, computed } from 'vue';
import MentionHelper, {type Mention} from '@/services/mentionHelper';
import { useStore, type Store } from 'vuex';
import { type State } from '@/store';

const props = defineProps<{
  placeholder: string,
  rows: number,
  modelValue: string,
}>();

type Replace = { mention: Mention, text: string };

const emit = defineEmits<{
  onSetMessageElement: [element: HTMLTextAreaElement],
  onReplaceInMessage: [replace: Replace],
  'update:modelValue': [value: string],
  onFinish: [],
}>();

const store: Store<State> = useStore();

const focused = ref(false);
const suggestMentions = ref(false);
const currentMention = ref<{ suggestions: string[], mention: Mention } | null>(null);
const selectedSuggestion = ref<number | null>(null);

const placeholderText = computed(() => !suggestMentions.value ? `${props.placeholder}...` : `${props.placeholder}\nUse @ for players and # for stars.`);

watch(() => props.modelValue, (v: string) => {
  if (!v || v === '') {
    currentMention.value = null;
  }
});

const messageElement = useTemplateRef('messageElement');

const useSuggestion = (suggestion: string) => {
  if (suggestMentions.value && currentMention.value) {
    selectedSuggestion.value = null;

    emit('onReplaceInMessage', {
      mention: currentMention.value.mention,
      text: suggestion
    });
  }
};

const onMessageChange = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value);
};

const setSelectedSuggestion = (newSelected: number) => {
  const suggestions = currentMention.value?.suggestions?.length!;

  selectedSuggestion.value = ((newSelected % suggestions) + suggestions) % suggestions;
};

const onKeyDown = (e: KeyboardEvent) => {
  const isEnterTabKey = e.key === 'Enter' || e.key === 'Tab'

  if (isEnterTabKey && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    currentMention.value = null;
    emit('onFinish');
  } else if (suggestMentions.value && currentMention.value && selectedSuggestion.value) {
    if (isEnterTabKey) {
      e.preventDefault();
      useSuggestion(currentMention.value.suggestions[selectedSuggestion.value]);
    } else if (e.key === 'ArrowDown' || e.key === 'Tab') {
      e.preventDefault();
      setSelectedSuggestion(selectedSuggestion.value + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion(selectedSuggestion.value - 1);
    }
  }
};

const onFocus = (e: FocusEvent) => {
  emit('onSetMessageElement', e.target as HTMLTextAreaElement);
};

const updateSuggestions = () => {
  if (suggestMentions.value) {
    const oldMention = currentMention.value;

    currentMention.value = MentionHelper.getCurrentMention(store.state.game, messageElement.value!);
    const newSuggestions = currentMention.value?.suggestions?.length;

    if (oldMention && !currentMention.value) {
      selectedSuggestion.value = null; //Mention was left
    } else if ((!oldMention || !oldMention.suggestions || !oldMention.suggestions.length) && newSuggestions) {
      selectedSuggestion.value = 0; //Mention was started
    }

    if (currentMention.value && selectedSuggestion.value != null) {
      //When the number of new suggestions is smaller, the selection might not get displayed otherwise
      setSelectedSuggestion(selectedSuggestion.value);
    }
  }
};

onMounted(() => {
  emit('onSetMessageElement', messageElement.value as HTMLTextAreaElement);
  suggestMentions.value = store.state.settings.interface.suggestMentions === 'enabled';
});
</script>

<style scoped>
.mention-box {
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
