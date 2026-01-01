<template>
  <div class="bg-dark pt-2 pb-1 mb-2 pointer row" :class="{'unread':!isRead, 'bg-secondary': isGlobal}"
       @click="doMarkAsRead">
    <div class="col">
      <span class="badge bg-info" v-if="isGlobal">Global Event</span>
    </div>
    <div v-if="event.tick" class="col-auto">
      <span class="badge" :class="{'bg-success':isRead,'bg-warning':!isRead}">Tick {{ event.tick }}</span>
    </div>
    <div class="col-12 mt-2">
      <game-ended :event="event" v-if="event.type === 'gameEnded'"
                  @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <game-player-afk :event="event" v-if="event.type === 'gamePlayerAFK'"
                       @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <game-player-defeated :event="event" v-if="event.type === 'gamePlayerDefeated'"
                            @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <game-player-joined :event="event" v-if="event.type === 'gamePlayerJoined'"
                          @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <game-player-quit :event="event" v-if="event.type === 'gamePlayerQuit'"
                        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <game-started :event="event" v-if="event.type === 'gameStarted'"/>
      <game-player-badge-purchased :event="event" v-if="event.type === 'gamePlayerBadgePurchased'"
                                   @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <game-diplomacy-peace-declared :event="event" v-if="event.type === 'gameDiplomacyPeaceDeclared'"/>
      <game-diplomacy-war-declared :event="event" v-if="event.type === 'gameDiplomacyWarDeclared'"/>

      <player-bulk-infrastructure-upgraded :event="event" v-if="event.type === 'playerBulkInfrastructureUpgraded'"/>
      <player-combat-star :event="event" v-if="event.type === 'playerCombatStar'"
                          @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <player-combat-carrier :event="event" v-if="event.type === 'playerCombatCarrier'"/>
      <player-credits-received :event="event" v-if="event.type === 'playerCreditsReceived'"
                               @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <player-credits-sent :event="event" v-if="event.type === 'playerCreditsSent'"
                           @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <player-credits-specialists-received :event="event" v-if="event.type === 'playerCreditsSpecialistsReceived'"
                                           @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <player-credits-specialists-sent :event="event" v-if="event.type === 'playerCreditsSpecialistsSent'"
                                       @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <player-gift-received :event="event" v-if="event.type === 'playerGiftReceived'"
                            @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <player-gift-sent :event="event" v-if="event.type === 'playerGiftSent'"
                        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <player-galactic-cycle-complete :event="event" v-if="event.type === 'playerGalacticCycleComplete'"/>
      <player-renown-received :event="event" v-if="event.type === 'playerRenownReceived'"
                              @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <player-renown-sent :event="event" v-if="event.type === 'playerRenownSent'"
                          @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <player-research-complete :event="event" v-if="event.type === 'playerResearchComplete'"/>
      <player-star-abandoned :event="event" v-if="event.type === 'playerStarAbandoned'"/>
      <player-star-died :event="event" v-if="event.type === 'playerStarDied'"/>
      <player-star-reignited :event="event" v-if="event.type === 'playerStarReignited'"/>
      <player-technology-received :event="event" v-if="event.type === 'playerTechnologyReceived'"
                                  @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <player-technology-sent :event="event" v-if="event.type === 'playerTechnologySent'"
                              @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <player-debt-forgiven :event="event" v-if="event.type === 'playerDebtForgiven'"
                            @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <player-debt-settled :event="event" v-if="event.type === 'playerDebtSettled'"
                           @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <player-star-specialist-hired :event="event" v-if="event.type === 'playerStarSpecialistHired'"/>
      <player-carrier-specialist-hired :event="event" v-if="event.type === 'playerCarrierSpecialistHired'"/>
      <player-conversation-created :event="event" v-if="event.type === 'playerConversationCreated'"/>
      <player-conversation-invited :event="event" v-if="event.type === 'playerConversationInvited'"/>
      <player-conversation-left :event="event" v-if="event.type === 'playerConversationLeft'"/>
      <player-diplomacy-status-changed :event="event" v-if="event.type === 'playerDiplomacyStatusChanged'"
                                       @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {inject, computed} from 'vue';
import GameEnded from './GameEnded.vue'
import GamePlayerAfk from './GamePlayerAFK.vue'
import GamePlayerDefeated from './GamePlayerDefeated.vue'
import GamePlayerBadgePurchased from './GamePlayerBadgePurchased.vue'
import GamePlayerJoined from './GamePlayerJoined.vue'
import GamePlayerQuit from './GamePlayerQuit.vue'
import GameStarted from './GameStarted.vue'
import PlayerBulkInfrastructureUpgraded from './PlayerBulkInfrastructureUpgraded.vue'
import PlayerCombatStar from './PlayerCombatStarEvent.vue'
import PlayerCombatCarrier from './PlayerCombatCarrierEvent.vue'
import PlayerCreditsReceived from './PlayerCreditsReceived.vue'
import PlayerCreditsSent from './PlayerCreditsSent.vue'
import PlayerCreditsSpecialistsReceived from './PlayerCreditsSpecialistsReceived.vue'
import PlayerCreditsSpecialistsSent from './PlayerCreditsSpecialistsSent.vue'
import PlayerGiftReceived from './PlayerGiftReceived.vue'
import PlayerGiftSent from './PlayerGiftSent.vue'
import PlayerGalacticCycleComplete from './PlayerGalacticCycleCompleteEvent.vue'
import PlayerRenownReceived from './PlayerRenownReceived.vue'
import PlayerRenownSent from './PlayerRenownSent.vue'
import PlayerResearchComplete from './PlayerResearchComplete.vue'
import PlayerStarAbandoned from './PlayerStarAbandoned.vue'
import PlayerStarDied from './PlayerStarDied.vue'
import PlayerStarReignited from './PlayerStarReignited.vue'
import PlayerTechnologyReceived from './PlayerTechnologyReceived.vue'
import PlayerTechnologySent from './PlayerTechnologySent.vue'
import PlayerDebtForgiven from './PlayerDebtForgiven.vue'
import PlayerDebtSettled from './PlayerDebtSettled.vue'
import PlayerStarSpecialistHired from './PlayerStarSpecialistHired.vue'
import PlayerCarrierSpecialistHired from './PlayerCarrierSpecialistHired.vue'
import PlayerConversationCreated from './PlayerConversationCreated.vue'
import PlayerConversationInvited from './PlayerConversationInvited.vue'
import PlayerConversationLeft from './PlayerConversationLeft.vue'
import GameDiplomacyPeaceDeclared from './GameDiplomacyPeaceDeclared.vue'
import GameDiplomacyWarDeclared from './GameDiplomacyWarDeclared.vue'
import PlayerDiplomacyStatusChanged from './PlayerDiplomacyStatusChanged.vue'
import type {GameEvent} from "@solaris-common";
import {httpInjectionKey, isOk} from "@/services/typedapi";
import {markAsRead} from "@/services/typedapi/event";
import {useStore} from 'vuex';
import type {Game} from "@/types/game";

const props = defineProps<{
  event: GameEvent<string>
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);

const onOpenPlayerDetailRequested = (playerId: string) => emit('onOpenPlayerDetailRequested', playerId);

const isRead = computed(() => props.event.read || props.event.read === null || props.event.read === undefined);

const isGlobal = computed(() => props.event.read === null || props.event.read === undefined);

const doMarkAsRead = async () => {
  if (isRead.value) {
    return;
  }

  const response = await markAsRead(httpClient)(game.value._id, props.event._id);
  props.event.read = isOk(response);
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}

.unread {
  border-top: 4px solid #f39c12;
  border-bottom: 4px solid #f39c12;
}
</style>
