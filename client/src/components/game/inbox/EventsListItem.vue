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
                <galactic-cycle-complete-event :event="event" v-if="event.type === 'galacticCycleComplete'"/>
                <combat-carrier-event :event="event" v-if="event.type === 'combatCarrier'" @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
                <combat-star-event :event="event" v-if="event.type === 'combatStar'" @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import GalacticCycleCompleteEventVue from './events/GalacticCycleCompleteEvent'
import CombatCarrierEventVue from './events/CombatCarrierEvent'
import CombatStarEventVue from './events/CombatStarEvent'

export default {
    components: {
        'galactic-cycle-complete-event': GalacticCycleCompleteEventVue,
        'combat-carrier-event': CombatCarrierEventVue,
        'combat-star-event': CombatCarrierEventVue,
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
