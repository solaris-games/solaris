<template>
  <div class="container message-container"
    :class="{'left-message': !isFromUserPlayer, 'right-message': isFromUserPlayer,
            'bg-dark': !message.pinned, 'bg-secondary': message.pinned}">
    <div class="row mt-0" v-if="fromPlayer" :style="{'background-color': fromColour}" style="height:6px;"></div>
    <div class="row mt-0" v-if="message">
      <div class="col mt-1 mb-0">
        <span class="pointer" @click="onOpenPlayerDetailRequested">
          <player-icon class="me-2" v-if="message.fromPlayerId" :playerId="message.fromPlayerId"/>
          <strong>{{message.fromPlayerAlias}}</strong>
        </span>
      </div>
      <div class="col-auto thumbtack" v-if="conversation.createdBy">
        <conversation-message-pin :conversationId="conversation._id" :messageId="message._id!" :pinned="message.pinned" @onPinned="onPinned" @onUnpinned="onUnpinned" />
      </div>
      <conversation-message-context-menu :conversation="conversation" :message="message" @onOpenReportPlayerRequested="onOpenReportPlayerRequested" :user-player="userPlayer" />
      <div class="col-12">
        <p class="mt-0 mb-0">
          <i class="fas fa-envelope me-2" v-if="!userPlayerHasReadMessage"></i>
          <small><em>{{dateText}}</em></small>
        </p>
      </div>
    </div>
    <div class="row mt-0">
        <div class="col">
            <p class="mt-2 mb-2 linebreaks" ref="messageElement" />
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GameHelper from '../../../../../services/gameHelper'
import PlayerIcon from '../../player/PlayerIcon.vue'
import ConversationMessagePin from './ConversationMessagePin.vue'
import mentionHelper from '../../../../../services/mentionHelper'
import ConversationMessageContextMenu from "./ConversationMessageContextMenu.vue";
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import { inject, onMounted, computed, useTemplateRef } from 'vue';
import type {Conversation, ConversationMessage, MapObject} from "@solaris-common";
import { useStore } from "vuex";
import type {Game} from "@/types/game";
import {isMobile} from "@/util/mobile";
import {toastInjectionKey} from "@/util/keys";

const props = defineProps<{
  conversation: Conversation<string>,
  message: ConversationMessage<string>
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
  onMinimizeConversationRequested: [],
  onOpenReportPlayerRequested: [{ playerId: string, messageId: string, conversationId: string }],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const messageElement = useTemplateRef("messageElement");

const store = useStore();
const game = computed<Game>(() => store.state.game);

const userPlayer = computed(() => GameHelper.getUserPlayer(game.value)!);
const isFromUserPlayer = computed(() => props.message.fromPlayerId === userPlayer.value._id);
const fromPlayer = computed(() => GameHelper.getPlayerById(game.value, props.message.fromPlayerId!));
const userPlayerHasReadMessage = computed(() => props.message.readBy.find(x => userPlayer.value._id === x) != null);
const fromColour = computed(() => store.getters.getColourForPlayer(fromPlayer.value!._id).value);
const dateText = computed(() => {
  const date = GameHelper.getDateString(props.message.sentDate);
  let tick = '';

  if (props.message.sentTick || props.message.sentTick === 0) {
    tick = ` (Tick ${props.message.sentTick})`;
  }

  return date + tick;
});

const panToStar = (id: string) => {
  const star = GameHelper.getStarById(game.value, id);

  if (star) {
    eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: star as MapObject<string> });
  } else {
    toast.error(`The location of the star is unknown.`);
  }
};

const onOpenReportPlayerRequested = (e: { playerId: string, messageId: string, conversationId: string }) => emit('onOpenReportPlayerRequested', e);

const getFriendlyColour = (colour: string) => GameHelper.getFriendlyColour(colour);

const onOpenPlayerDetailRequested = () => props.message.fromPlayerId && emit('onOpenPlayerDetailRequested', props.message.fromPlayerId);

const onPinned = () => props.message.pinned = true;

const onUnpinned = () => props.message.pinned = false;

onMounted(() => {
  const onStarClicked = (id: string) => {
    panToStar(id);

    if (isMobile()) {
      emit('onMinimizeConversationRequested');
    }
  };

  const onPlayerClicked = (id) => emit('onOpenPlayerDetailRequested', id);

  mentionHelper.renderMessageWithMentionsAndLinks(messageElement.value!, props.message.message, onStarClicked, onPlayerClicked);
});
</script>

<style scoped>
.left-message {
  width: 85%;
  margin-left:0;
}

.right-message {
  width: 85%;
  margin-right:0;
}

.pointer {
  cursor: pointer;
}

.linebreaks {
  white-space: break-spaces;
  word-wrap: break-word;
}

.thumbtack {
  display: none;
}

.message-container:hover .thumbtack {
  display: block;
}
</style>
