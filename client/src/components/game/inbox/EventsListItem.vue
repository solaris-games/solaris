<template>
<div class="container bg-primary pt-2 pb-1 mb-2">
    <div class="row">
        <div class="col text-right">
            <span class="badge badge-success">Tick {{event.tick}}</span>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <div class="mt-2">
                <game-ended :event="event" v-if="event.type === 'gameEnded'"/>
                <game-paused :event="event" v-if="event.type === 'gamePaused'"/>
                <game-player-afk :event="event" v-if="event.type === 'gamePlayerAFK'"/>
                <game-player-defeated :event="event" v-if="event.type === 'gamePlayerDefeated'"/>
                <game-player-joined :event="event" v-if="event.type === 'gamePlayerJoined'"/>
                <game-player-quit :event="event" v-if="event.type === 'gamePlayerQuit'"/>
                <game-started :event="event" v-if="event.type === 'gameStarted'"/>

                <player-bulk-infrastructure-upgraded :event="event" v-if="event.type === 'playerBulkInfrastructureUpgraded'"/>
                <player-carrier-built :event="event" v-if="event.type === 'playerCarrierBuilt'"/>
                <player-combat-carrier :event="event" v-if="event.type === 'playerCombatCarrier'" @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
                <player-combat-star :event="event" v-if="event.type === 'playerCombatStar'" @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
                <player-credits-received :event="event" v-if="event.type === 'playerCreditsReceived'"/>
                <player-credits-sent :event="event" v-if="event.type === 'playerCreditsSent'"/>
                <player-galactic-cycle-complete :event="event" v-if="event.type === 'playerGalacticCycleComplete'"/>
                <player-renown-received :event="event" v-if="event.type === 'playerRenownReceived'"/>
                <player-renown-sent :event="event" v-if="event.type === 'playerRenownSent'"/>
                <player-research-complete :event="event" v-if="event.type === 'playerResearchComplete'"/>
                <player-star-abandoned :event="event" v-if="event.type === 'playerStarAbandoned'"/>
                <player-star-captured :event="event" v-if="event.type === 'playerStarCaptured'"/>
                <player-star-warp-gate-built :event="event" v-if="event.type === 'playerStarWarpGateBuilt'"/>
                <player-star-warp-gate-destroyed :event="event" v-if="event.type === 'playerStarWarpGateDestroyed'"/>
                <player-technology-received :event="event" v-if="event.type === 'playerTechnologyReceived'"/>
                <player-technology-sent :event="event" v-if="event.type === 'playerTechnologySent'"/>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import GameEndedVue from './events/GameEnded'
import GamePausedVue from './events/GamePaused'
import GamePlayerAFKVue from './events/GamePlayerAFK'
import GamePlayerDefeatedVue from './events/GamePlayerDefeated'
import GamePlayerJoinedVue from './events/GamePlayerJoined'
import GamePlayerQuitVue from './events/GamePlayerQuit'
import GameStartedVue from './events/GameStarted'
import PlayerBulkInfrastructureUpgradedVue from './events/PlayerBulkInfrastructureUpgraded'
import PlayerCarrierBuiltVue from './events/PlayerCarrierBuilt'
import PlayerCombatCarrierEventVue from './events/PlayerCombatCarrierEvent'
import PlayerCombatStarEventVue from './events/PlayerCombatStarEvent'
import PlayerCreditsReceivedVue from './events/PlayerCreditsReceived'
import PlayerCreditsSentVue from './events/PlayerCreditsSent'
import PlayerGalacticCycleCompleteEventVue from './events/PlayerGalacticCycleCompleteEvent'
import PlayerRenownReceivedVue from './events/PlayerRenownReceived'
import PlayerRenownSentVue from './events/PlayerRenownSent'
import PlayerResearchCompleteVue from './events/PlayerResearchComplete'
import PlayerStarAbandonedVue from './events/PlayerStarAbandoned'
import PlayerStarCapturedVue from './events/PlayerStarCaptured'
import PlayerStarWarpGateBuiltVue from './events/PlayerStarWarpGateBuilt'
import PlayerStarWarpGateDestroyedVue from './events/PlayerStarWarpGateDestroyed'
import PlayerTechnologyReceivedVue from './events/PlayerTechnologyReceived'
import PlayerTechnologySentVue from './events/PlayerTechnologySent'

export default {
    components: {
        'game-ended': GameEndedVue,
        'game-paused': GamePausedVue,
        'game-player-afk': GamePlayerAFKVue,
        'game-player-defeated': GamePlayerDefeatedVue,
        'game-player-joined': GamePlayerJoinedVue,
        'game-player-quit': GamePlayerQuitVue,
        'game-started': GameStartedVue,
        'player-bulk-infrastructure-upgraded': PlayerBulkInfrastructureUpgradedVue,
        'player-carrier-built': PlayerCarrierBuiltVue,
        'player-combat-carrier': PlayerCombatCarrierEventVue,
        'player-combat-star': PlayerCombatStarEventVue,
        'player-credits-received': PlayerCreditsReceivedVue,
        'player-credits-sent': PlayerCreditsSentVue,
        'player-galactic-cycle-complete': PlayerGalacticCycleCompleteEventVue,
        'player-renown-received': PlayerRenownReceivedVue,
        'player-renown-sent': PlayerRenownSentVue,
        'player-research-complete': PlayerResearchCompleteVue,
        'player-star-abandoned': PlayerStarAbandonedVue,
        'player-star-captured': PlayerStarCapturedVue,
        'player-star-warp-gate-built': PlayerStarWarpGateBuiltVue,
        'player-star-warp-gate-destroyed': PlayerStarWarpGateDestroyedVue,
        'player-technology-received': PlayerTechnologyReceivedVue,
        'player-technology-sent': PlayerTechnologySentVue
    },
    props: {
        event: Object
    },
    methods: {
        onOpenStarDetailRequested (e) {
            this.$emit('onOpenStarDetailRequested', e)
        }
    }
}
</script>

<style scoped>
</style>
