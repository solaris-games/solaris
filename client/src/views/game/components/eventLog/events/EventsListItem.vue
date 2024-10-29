<template>
<div class="bg-dark pt-2 pb-1 mb-2 pointer row" :class="{'unread':!isRead, 'bg-secondary': isGlobal}" @click="markAsRead">
    <div class="col">
        <span class="badge bg-info" v-if="isGlobal">Global Event</span>
    </div>
    <div v-if="event.tick" class="col-auto">
        <span class="badge" :class="{'bg-success':isRead,'bg-warning':!isRead}">Tick {{event.tick}}</span>
    </div>
    <div class="col-12 mt-2">
        <game-ended :event="event" v-if="event.type === 'gameEnded'"
            @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
        <game-paused :event="event" v-if="event.type === 'gamePaused'"/>
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

<script>
import EventApiService from '../../../../../services/api/event'
import GameEndedVue from './GameEnded.vue'
import GamePausedVue from './GamePaused.vue'
import GamePlayerAFKVue from './GamePlayerAFK.vue'
import GamePlayerDefeatedVue from './GamePlayerDefeated.vue'
import GamePlayerBadgePurchasedVue from './GamePlayerBadgePurchased.vue'
import GamePlayerJoinedVue from './GamePlayerJoined.vue'
import GamePlayerQuitVue from './GamePlayerQuit.vue'
import GameStartedVue from './GameStarted.vue'
import PlayerBulkInfrastructureUpgradedVue from './PlayerBulkInfrastructureUpgraded.vue'
import PlayerCombatStarEventVue from './PlayerCombatStarEvent.vue'
import PlayerCombatCarrierEventVue from './PlayerCombatCarrierEvent.vue'
import PlayerCreditsReceivedVue from './PlayerCreditsReceived.vue'
import PlayerCreditsSentVue from './PlayerCreditsSent.vue'
import PlayerCreditsSpecialistsReceivedVue from './PlayerCreditsSpecialistsReceived.vue'
import PlayerCreditsSpecialistsSentVue from './PlayerCreditsSpecialistsSent.vue'
import PlayerGiftReceivedVue from './PlayerGiftReceived.vue'
import PlayerGiftSentVue from './PlayerGiftSent.vue'
import PlayerGalacticCycleCompleteEventVue from './PlayerGalacticCycleCompleteEvent.vue'
import PlayerRenownReceivedVue from './PlayerRenownReceived.vue'
import PlayerRenownSentVue from './PlayerRenownSent.vue'
import PlayerResearchCompleteVue from './PlayerResearchComplete.vue'
import PlayerStarAbandonedVue from './PlayerStarAbandoned.vue'
import PlayerStarDiedVue from './PlayerStarDied.vue'
import PlayerStarReignitedVue from './PlayerStarReignited.vue'
import PlayerTechnologyReceivedVue from './PlayerTechnologyReceived.vue'
import PlayerTechnologySentVue from './PlayerTechnologySent.vue'
import PlayerDebtForgivenVue from './PlayerDebtForgiven.vue'
import PlayerDebtSettledVue from './PlayerDebtSettled.vue'
import PlayerStarSpecialistHiredVue from './PlayerStarSpecialistHired.vue'
import PlayerCarrierSpecialistHiredVue from './PlayerCarrierSpecialistHired.vue'
import PlayerConversationCreatedVue from './PlayerConversationCreated.vue'
import PlayerConversationInvitedVue from './PlayerConversationInvited.vue'
import PlayerConversationLeftVue from './PlayerConversationLeft.vue'
import GameDiplomacyPeaceDeclaredVue from './GameDiplomacyPeaceDeclared.vue'
import GameDiplomacyWarDeclaredVue from './GameDiplomacyWarDeclared.vue'
import PlayerDiplomacyStatusChangedVue from './PlayerDiplomacyStatusChanged.vue'

export default {
  components: {
    'game-ended': GameEndedVue,
    'game-paused': GamePausedVue,
    'game-player-afk': GamePlayerAFKVue,
    'game-player-defeated': GamePlayerDefeatedVue,
    'game-player-badge-purchased': GamePlayerBadgePurchasedVue,
    'game-player-joined': GamePlayerJoinedVue,
    'game-player-quit': GamePlayerQuitVue,
    'game-started': GameStartedVue,
    'game-diplomacy-peace-declared': GameDiplomacyPeaceDeclaredVue,
    'game-diplomacy-war-declared': GameDiplomacyWarDeclaredVue,

    'player-bulk-infrastructure-upgraded': PlayerBulkInfrastructureUpgradedVue,
    'player-combat-star': PlayerCombatStarEventVue,
    'player-combat-carrier': PlayerCombatCarrierEventVue,
    'player-credits-received': PlayerCreditsReceivedVue,
    'player-credits-sent': PlayerCreditsSentVue,
    'player-credits-specialists-received': PlayerCreditsSpecialistsReceivedVue,
    'player-credits-specialists-sent': PlayerCreditsSpecialistsSentVue,
    'player-gift-received': PlayerGiftReceivedVue,
    'player-gift-sent': PlayerGiftSentVue,
    'player-galactic-cycle-complete': PlayerGalacticCycleCompleteEventVue,
    'player-renown-received': PlayerRenownReceivedVue,
    'player-renown-sent': PlayerRenownSentVue,
    'player-research-complete': PlayerResearchCompleteVue,
    'player-star-abandoned': PlayerStarAbandonedVue,
    'player-star-died': PlayerStarDiedVue,
    'player-star-reignited': PlayerStarReignitedVue,
    'player-technology-received': PlayerTechnologyReceivedVue,
    'player-technology-sent': PlayerTechnologySentVue,
    'player-debt-forgiven': PlayerDebtForgivenVue,
    'player-debt-settled': PlayerDebtSettledVue,
    'player-star-specialist-hired': PlayerStarSpecialistHiredVue,
    'player-carrier-specialist-hired': PlayerCarrierSpecialistHiredVue,
    'player-conversation-created': PlayerConversationCreatedVue,
    'player-conversation-invited': PlayerConversationInvitedVue,
    'player-conversation-left': PlayerConversationLeftVue,
    'player-diplomacy-status-changed': PlayerDiplomacyStatusChangedVue,
  },
  props: {
    event: Object
  },
  methods: {
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    },
    async markAsRead () {
        if (this.isRead) {
            return
        }

      try {
        this.event.read = true

        await EventApiService.markEventAsRead(this.$store.state.game._id, this.event._id)
      } catch (e) {
        console.error(e)
        this.event.read = false
      }
    }
  },
  computed: {
      isRead () {
          return this.event.read || this.event.read == null
      },
      isGlobal () {
          return this.event.read == null
      }
  }
}
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
