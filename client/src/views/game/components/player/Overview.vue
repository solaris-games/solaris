<template>
<div v-if="player">
  <player-title :player="player"/>

  <div class="row pt-0">
      <div class="col-auto text-center ps-0 pe-0">
        <img v-if="player.avatar" :src="getAvatarImage()" :alt="player.alias">
        <i v-if="!player.avatar" class="far fa-user me-2 mt-2 ms-2 mb-2" style="font-size:100px;"></i>
      </div>
      <div class="col bg-dark">
          <statistics :playerId="playerId"/>
      </div>
  </div>

  <div class="row pt-2 pb-2 bg-dark" v-if="userPlayer && (!gameHasStarted || player.userId)">
    <div class="col-auto">
      <button class="btn btn-primary me-1" @click="onViewColourOverrideRequested">
        <i class="fas fa-paint-brush" />
        <span v-if="!isCompactUIStyle" class="d-none d-md-inline-block ms-1">Customise colour</span>
      </button>
    </div>
  </div>

  <div class="row pt-2 pb-2 bg-dark" v-if="gameHasStarted && !player.userId && userPlayer">
    <div class="col">
      <button class="btn btn-outline-secondary me-1" @click="onOpenDiplomacyRequested" title="Open Diplomacy" v-if="isFormalAlliancesEnabled">
        <i class="fas fa-globe-americas"></i>
      </button>
      <button class="btn btn-outline-secondary me-1" @click="onOpenLedgerRequested" title="Open Ledger" v-if="isTradeEnabled">
        <i class="fas fa-file-invoice-dollar"></i>
      </button>
      <button class="btn btn-outline-secondary" @click="onViewCompareIntelRequested" title="Compare Intel" v-if="!isDarkModeExtra">
        <i class="fas fa-chart-line"></i>
      </button>
    </div>
    <div class="col-auto">
      <button class="btn btn-primary me-1" @click="onViewColourOverrideRequested">
        <i class="fas fa-paint-brush" />
        <span v-if="!isCompactUIStyle" class="d-none d-md-inline-block ms-1">Customise colour</span>
      </button>
      <button class="btn btn-success me-1" @click="onViewConversationRequested"
        :class="{'btn-warning': conversation && conversation.unreadCount}"
        v-if="canCreateConversation">
        <i class="fas fa-envelope"></i>
        <span v-if="conversation && conversation.unreadCount" class="ms-1">{{conversation.unreadCount}}</span>
      </button>
      <button class="btn btn-info" v-if="!gameHasFinished && isTradeEnabled" @click="onOpenTradeRequested">
        <i class="fas fa-handshake" />
        <span v-if="!isCompactUIStyle" class="d-none d-md-inline-block ms-1">Trade</span>
      </button>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { eventBusInjectionKey } from '../../../../eventBus'
import MENU_STATES from '../../../../services/data/menuStates'
import Statistics from './Statistics.vue'
import PlayerTitle from './PlayerTitle.vue'
import gameHelper from '../../../../services/gameHelper'
import ConversationApiService from '../../../../services/api/conversation'
import DiplomacyHelper from '../../../../services/diplomacyHelper'
import { ref, inject, computed, onMounted } from 'vue'
import MenuEventBusEventNames from '../../../../eventBusEventNames/menu'
import type {Game, Player} from "@/types/game";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import { useStore } from 'vuex';
import type {Conversation, ConversationOverview} from "@solaris-common";
import GameHelper from "../../../../services/gameHelper";
import {listPrivate} from "@/services/typedapi/conversation";

const props = defineProps<{
  playerId: string,
}>();

const emit = defineEmits<{
  onViewColourOverrideRequested: [playerId: string],
  onViewCompareIntelRequested: [playerId: string],
  onOpenTradeRequested: [playerId: string],
}>();

const httpClient = inject(httpInjectionKey)!;
const eventBus = inject(eventBusInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);

const gameHasStarted = computed(() => GameHelper.isGameStarted(game.value));
const gameHasFinished = computed(() => GameHelper.isGameFinished(game.value));
const isDarkModeExtra = computed(() => GameHelper.isDarkModeExtra(game.value));
const isTradeEnabled = computed(() => GameHelper.isTradeEnabled(game.value));
const isFormalAlliancesEnabled = computed(() => DiplomacyHelper.isFormalAlliancesEnabled(game.value));
const isCompactUIStyle = computed(() => store.state.settings.interface.uiStyle !== 'standard');
const canCreateConversation = computed(() => game.value.settings.general.playerLimit > 2 && !GameHelper.isTutorialGame(game.value));

const player = computed(() => GameHelper.getPlayerById(game.value, props.playerId)!);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));

const conversation = ref<ConversationOverview<string> | null>(null);

const getAvatarImage = () => {
  return new URL(`../../../../assets/avatars/${player.value.avatar}`, import.meta.url).href;
};

const loadConversation = async () => {
  if (userPlayer.value && userPlayer.value._id !== player.value._id) {
    const response = await listPrivate(httpClient)(game.value._id, player.value._id);
    if (isOk(response)) {
      conversation.value = response.data;
    } else {
      console.error(formatError(response));
    }
  }
};

const onViewColourOverrideRequested = () => emit('onViewColourOverrideRequested', player.value._id);

const onViewCompareIntelRequested = () => emit('onViewCompareIntelRequested', player.value._id);

const onOpenTradeRequested = () => emit('onOpenTradeRequested', player.value._id);

const onOpenDiplomacyRequested = () => {
  store.commit('setMenuState', {
    state: MENU_STATES.DIPLOMACY,
  });
};

const onOpenLedgerRequested = () => {
  store.commit('setMenuState', {
    state: MENU_STATES.LEDGER,
  });
};

const onViewConversationRequested = () => {
  if (!userPlayer.value) {
    return;
  }

  if (conversation.value) {
    eventBus.emit(MenuEventBusEventNames.OnViewConversationRequested, {
      conversationId: conversation.value._id,
    });
  } else {
    eventBus.emit(MenuEventBusEventNames.OnViewConversationRequested, {
      participantIds: [
        userPlayer.value!._id,
        player.value._id
      ]
    });
  }
}

onMounted(async () => {
  await loadConversation();
});
</script>

<style scoped>
</style>
