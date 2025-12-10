<template>
<div class="menu-page">
  <div class="container">
    <menu-title title="New Conversation" @onCloseRequested="onCloseRequested">
      <button class="btn btn-sm btn-outline-primary" @click="onOpenInboxRequested" title="Back to Inbox"><i class="fas fa-inbox"></i></button>
    </menu-title>

    <div class="row">
      <form class="col-12 pb-2" @submit="doCreateConversation">
        <div class="col-12">
            <form-error-list v-bind:errors="errors"/>
        </div>
        <div class="mb-2">
          <label for="name">Name</label>
          <input type="text" class="form-control" id="name" placeholder="Enter a name for the group" v-model="name">
        </div>

        <div class="mb-2">
          <label for="participants">Participants</label>
          <select multiple class="form-control" id="participants" v-model="participants">
            <option v-for="participant in possibleParticipants" :key="participant._id" :value="participant._id">
              {{participant.alias}}
            </option>
          </select>
        </div>

        <button type="submit" class="btn btn-success float-end" :disabled="isLoading">
          <i class="fas fa-comments"></i>
          Create Conversation
        </button>
      </form>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import GameHelper from '../../../../../services/gameHelper';
import MenuTitle from '../../MenuTitle.vue';
import FormErrorList from '../../../../components/FormErrorList.vue';
import { inject, ref, computed, onMounted } from 'vue';
import { eventBusInjectionKey } from '../../../../../eventBus';
import MenuEventBusEventNames from '../../../../../eventBusEventNames/menu';
import { useStore } from 'vuex';
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {createConversation} from "@/services/typedapi/conversation";
import type {Game, Player} from "@/types/game";

const props = defineProps<{
  participantIds: string[],
}>();

const emit = defineEmits<{
  onCloseRequested: [],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);

const userPlayer = computed(() => GameHelper.getUserPlayer(game.value)!);

const isLoading = ref(false);
const errors = ref<string[]>([]);
const name = ref('');
const participants = ref<string[]>([]);
const possibleParticipants = ref<Player[]>([]);

const onCloseRequested = () => emit('onCloseRequested');

const onOpenInboxRequested = () => eventBus.emit(MenuEventBusEventNames.OnOpenInboxRequested);

const doCreateConversation = async (e: Event) => {
  errors.value = [];

  if (!name.value.length) {
    errors.value.push('Name is required.');
  }

  if (!participants.value.length) {
    errors.value.push('Must have at least one participant selected.');
  }

  e.preventDefault();

  if (errors.value.length) {
    return;
  }

  isLoading.value = true;

  const response = await createConversation(httpClient)(game.value._id, name.value, participants.value);
  if (isOk(response)) {
    eventBus.emit(MenuEventBusEventNames.OnViewConversationRequested, {
      conversationId: response.data._id,
    });
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};

onMounted(() => {
  possibleParticipants.value = game.value.galaxy.players.filter(p => p._id !== userPlayer.value._id);

  if (props.participantIds?.length) {
    participants.value = props.participantIds.slice();
  }
});
</script>

<style scoped>
select {
  min-height: 200px;
}
</style>
