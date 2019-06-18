<template>
<div class="bg-primary">
    <div class="container">
        <div class="row no-gutters pt-2 pb-2">
            <div class="col-1">
                <button class="btn btn-sm btn-info">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
            <div class="col-4 text-center">
                <span class="align-middle">Credits: ${{credits}}</span>
            </div>
            <div class="col-6 text-center">
                <span class="align-middle">Production: {{timeRemaining}}</span>
            </div>
            <div class="col-1">
                <button class="btn btn-sm btn-info">
                    <i class="fas fa-inbox"></i>
                </button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { setInterval } from 'timers';

export default {
    props: {
        credits: Number,
        nextProduction: Date
    },
    data() {
        return {
            forceRecomputeCounter: 0 // Need to use this hack to force vue to recalculate the time remaining
        };
    },
    mounted() {
        setInterval(() => {
            this.forceRecomputeCounter++;
        }, 1000);
    },
    computed: {
        timeRemaining: function() {
            this.forceRecomputeCounter;
            
            let t = this.nextProduction - new Date().getTime();

            let days = Math.floor(t / (1000 * 60 * 60 * 24));
            let hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let mins = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
            let secs = Math.floor((t % (1000 * 60)) / 1000);

            return `${days}d ${hours}h ${mins}m ${secs}s`;
        }
    }
}
</script>

<style scoped>
</style>
