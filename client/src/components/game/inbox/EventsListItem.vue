<template>
<div class="container bg-primary pt-2 pb-1 mb-2">
    <div class="row">
        <div class="col">
            <p class="mt-2">{{getEventText(event)}}</p>
        </div>
        <div class="col-auto">
            <span class="badge badge-success">Tick {{event.tick}}</span>
        </div>
    </div>
</div>
</template>

<script>
export default {
    props: {
        event: Object
    },
    methods: {
        // TODO: All this stuff should be in a service.
        getEventText (event) {
            switch (event.type) {
                case 'galacticCycleComplete':
                    return this.getGalacticCycleCompleteText(event)
            }

            return JSON.stringify(event)
        },
        getGalacticCycleCompleteText (event) {
            return `A galactic cycle is complete. You have received $${event.data.creditsEconomy} from your
                economic infrastructure and $${event.data.creditsBanking} from your banking technology.
                
                Your experimental scientists have stumbled across a new discovery which has unlocked 
                ${event.data.experimentAmount} points of research in the field of ${event.data.experimentTechnology}.`
        }
    }
}
</script>

<style scoped>
</style>
