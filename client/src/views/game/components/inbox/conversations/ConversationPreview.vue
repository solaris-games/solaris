<template>
<div class="container pt-1"
  :class="{'bg-secondary': !isAllPlayersConversation, 'bg-primary': isAllPlayersConversation, 'bg-warning':conversation.unreadCount}"
    @click="openConversation">
    <div class="row pb-1">
        <div class="col">
          <span>
              <strong>{{conversation.name}}</strong>
          </span>
        </div>
        <div class="col-auto player-icons" v-if="!isAllPlayersConversation">
          <small v-for="participant in conversation.participants" :key="participant">
            <player-icon :playerId="participant"/>
          </small>
        </div>
        <div class="col-auto">
          <small v-if="conversation.isMuted" title="This conversation is muted" class="me-1">
            <i class="fas fa-bell-slash"></i>
          </small>
          <small v-if="!hasReadLastMessage && conversation.unreadCount">
            <i class="fas fa-envelope"></i>
            {{conversation.unreadCount}}
          </small>
          <small>
            <i class="fas fa-user"></i>
            {{conversation.participants.length}}
          </small>
        </div>
    </div>
    <div class="row bg-dark mt-0">
        <div class="col-12" v-if="hasLastMessage && lastMessageSender">
          <p class="mt-2 mb-2" :class="{'truncate':isTruncated}">
            <player-icon v-if="lastMessage!.fromPlayerId" :playerId="lastMessageSender._id" />
            <span class="lastMessage">{{lastMessageText}}</span>
          </p>
        </div>
        <div class="col-12" v-if="hasLastMessage && lastMessage">
            <small class="float-end mb-2"><i>{{GameHelper.getDateString(lastMessage.sentDate)}}</i></small>
        </div>
        <div class="col-12" v-if="!hasLastMessage">
            <p class="mt-2 mb-2">No messages.</p>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { eventBusInjectionKey } from '../../../../../eventBus'
import GameHelper from '../../../../../services/gameHelper'
import PlayerIcon from '../../player/PlayerIcon.vue'
import mentionHelper from '../../../../../services/mentionHelper'
import { inject, computed } from 'vue'
import MenuEventBusEventNames from '../../../../../eventBusEventNames/menu'
import type {ConversationOverview} from "@solaris-common";
import { useStore } from 'vuex';
import type {Game} from "@/types/game";

const props = defineProps<{
  conversation: ConversationOverview<string>,
  isTruncated: boolean,
  isFullWidth: boolean,
}>();

const eventBus = inject(eventBusInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);

const userPlayer = computed(() => GameHelper.getUserPlayer(game.value)!);
const hasLastMessage = computed(() => props.conversation.lastMessage != null);
const lastMessage = computed(() => props.conversation.lastMessage);
const hasReadLastMessage = computed(() => hasLastMessage.value && props.conversation.lastMessage!.readBy.find(r => r === userPlayer.value._id));
const lastMessageSender = computed(() => props.conversation.lastMessage?.fromPlayerId && GameHelper.getPlayerById(game.value, props.conversation.lastMessage.fromPlayerId));
const isAllPlayersConversation = computed(() => props.conversation.participants.length === game.value.settings.general.playerLimit);

const lastMessageText = computed(() => lastMessage.value && mentionHelper.replaceMentionsWithNames(lastMessage.value.message));

const getFriendlyColour = (colour: string) => GameHelper.getFriendlyColour(colour);

const openConversation = () => {
  eventBus.emit(MenuEventBusEventNames.OnViewConversationRequested, {
    conversationId: props.conversation._id,
  });
};
</script>

<style scoped>
.container {
    cursor: pointer;
}

.player-icons {
  margin-top: -2px;
}

.truncate {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}

.lastMessage {
  margin-left: 12px;
}
</style>
