<template>
<div class="bg-primary">
    <div class="container-fluid">
        <div class="row no-gutters pt-2 pb-2">
            <div class="col-auto dropdown">
                <button class="btn btn-sm btn-info" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.LEADERBOARD)"><i class="fas fa-users mr-2"></i>Leaderboard</a>
                    <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.RESEARCH)"><i class="fas fa-flask mr-2"></i>Research</a>
                    <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.GALAXY)"><i class="fas fa-star mr-2"></i>Galaxy</a>
                    <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.INTEL)"><i class="fas fa-chart-line mr-2"></i>Intel</a>
                    <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.OPTIONS)"><i class="fas fa-cog mr-2"></i>Options</a>
                    <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.HELP)"><i class="fas fa-question mr-2"></i>Help</a>
                    <a class="dropdown-item" v-on:click="goToMainMenu()"><i class="fas fa-chevron-left mr-2"></i>Main Menu</a>
                </div>
            </div>
            <div class="col-auto ml-3 mr-2 text-center">
                <span class="align-middle">Credits: ${{credits}}</span>
            </div>
            <div class="col text-center">
                <span class="align-middle">Production: {{timeRemaining}}</span>
            </div>
            <div class="col-auto">
                <button class="btn btn-sm btn-info" v-on:click="setMenuState(MENU_STATES.INBOX)">
                    <i class="fas fa-inbox"></i>
                </button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import router from '../../../router';
import { setInterval } from 'timers';
import MENU_STATES from '../../data/menuStates';

export default {
    props: {
        credits: Number,
        nextProduction: Date,
        onMenuStateChanged: Function
    },
    data() {
        return {
            forceRecomputeCounter: 0, // Need to use this hack to force vue to recalculate the time remaining
            MENU_STATES: MENU_STATES
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

            let str = '';

            if (days > 0) {
                str += `${days}d `;
            }

            if (hours > 0) {
                str += `${hours}h `;
            }

            if (mins > 0) {
                str += `${mins}m `;
            }

            str += `${secs}s`;

            return str;
        }
    },
    methods: {
        setMenuState(state, args) {
            this.$emit('onMenuStateChanged', {
                state,
                args
            });
        },
        goToMainMenu() {
            router.push({ name: 'main-menu' });
        }
    }
}
</script>

<style scoped>
</style>
