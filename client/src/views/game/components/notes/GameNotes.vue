<template>
  <div class="menu-page container">
    <menu-title title="Notes" @onCloseRequested="onCloseRequested"/>

    <loading-spinner :loading="isLoadingNotes"/>

    <div class="row" v-show="!isLoadingNotes">
      <div class="col-12">
        <p v-show="!isEditing" ref="notesReadonlyElement" class="notes-readonly"></p>
        <mention-box v-if="isEditing" placeholder="Write your notes here" :rows="15" v-model="notes"
                     @onSetMessageElement="onSetMessageElement" @onReplaceInMessage="onReplaceInMessage"
                     @onFinish="updateGameNotes"/>
      </div>

      <div class="col">
        <span v-if="isEditing" :class="{'text-danger':isExceededMaxLength}">{{ noteLength }}/5000</span>
      </div>
      <div class="col-auto mt-2 mb-2">
        <button v-if="!isEditing" class="btn btn-primary" @click="beginEditing">
          <i class="fas fa-edit"></i> Edit Notes
        </button>
        <button v-if="isEditing" class="btn btn-success" :disabled="isSavingNotes || isExceededMaxLength"
                @click="updateGameNotes">
          <i class="fas fa-save"></i> Save Notes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MenuTitle from '../MenuTitle.vue'
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import MentionBox from '../shared/MentionBox.vue'
import MentionHelper, {type Mention} from '@/services/mentionHelper';
import GameHelper from "@/services/gameHelper";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import {eventBusInjectionKey} from "@/eventBus";
import { ref, computed, inject, onMounted, useTemplateRef } from 'vue';
import { useStore } from 'vuex';
import {getNotes, writeNotes} from "@/services/typedapi/game";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";

const emit = defineEmits<{
  onCloseRequested: [e: Event],
  onOpenPlayerDetailRequested: [playerId: string]
}>();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store = useStore();

const isLoadingNotes = ref(false);
const isSavingNotes = ref(false);
const isEditing = ref(false);
const readonlyNotes = ref('');
const notes = ref('');

const notesReadonlyElement = useTemplateRef('notesReadonlyElement');

const noteLength = computed(() => {
  if (notes.value == null) {
    return 0
  }

  const staticText = MentionHelper.makeMentionsStatic(store.state.game, notes.value)

  return staticText.length
});

const isExceededMaxLength = computed(() => noteLength.value > 5000);

const beginEditing = () => {
  isEditing.value = true
  notes.value = MentionHelper.makeMentionsEditable(store.state.game, readonlyNotes.value);
};

const onSetMessageElement = (element: HTMLElement) => {
  store.commit('setMentions', {
    element,
    callbacks: {
      player: (player) => {
        notes.value = MentionHelper.addMention(notes.value, store.state.mentionReceivingElement, 'player', player.alias)
      },
      star: (star) => {
        notes.value = MentionHelper.addMention(notes.value, store.state.mentionReceivingElement, 'star', star.name)
      }
    }
  })
};

const onCloseRequested = (e: Event) => {
  emit('onCloseRequested', e)
};

const onReplaceInMessage = (data: { mention: Mention, text: string }) => {
  notes.value = MentionHelper.useSuggestion(notes.value, store.state.mentionReceivingElement, data);
};

const updateGameNotes = async () => {
  isEditing.value = false;
  isSavingNotes.value = true;

  const newNotes = MentionHelper.makeMentionsStatic(store.state.game, notes.value);
  const response = await writeNotes(httpClient)(store.state.game._id, newNotes);

  if (isOk(response)) {
    setReadonlyNotes(newNotes)
    // @ts-ignore
    toast.success(`Game notes updated.`)
  } else {
    console.error(formatError(response));
  }

  isSavingNotes.value = false
};

const setReadonlyNotes = (notesParam: string) => {
  MentionHelper.resetMessageElement(notesReadonlyElement.value!);
  readonlyNotes.value = notesParam || ''
  MentionHelper.renderMessageWithMentionsAndLinks(notesReadonlyElement.value!, readonlyNotes.value, onStarClicked, onPlayerClicked);
};

const panToStar = (id: string) => {
  const star = GameHelper.getStarById(store.state.game, id)
  if (star) {
    eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToLocation, { location: star.location });
  } else {
    toast.error(`The location of the star is unknown.`)
  }
};

const onStarClicked = (id: string) => {
  panToStar(id);
};

const onPlayerClicked = (id: string) => {
  emit('onOpenPlayerDetailRequested', id)
};


const loadGameNotes = async () => {
  isLoadingNotes.value = true;

  const response = await getNotes(httpClient)(store.state.game._id);
  if (isOk(response)) {
    setReadonlyNotes(response.data.notes || '')
  } else {
    console.error(formatError(response));
  }

  isLoadingNotes.value = false
};

onMounted(async () => {
  await loadGameNotes();
});
</script>

<style scoped>
.notes-readonly {
  padding: 6px 12px;
  letter-spacing: normal;
  white-space: pre-wrap;
}
</style>
