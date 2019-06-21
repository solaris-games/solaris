<template>
<div class="menu">
    <game-info v-bind:credits="500" v-bind:nextProduction="new Date()" @onMenuStateChanged="onMenuStateChanged"/>

    <player-list v-bind:players="game.galaxy.players" @onPlayerSelected="onPlayerSelected"/>

    <div v-if="currentMenuState == MENU_STATES.RESEARCH">RESEARCH</div>
    <div v-if="currentMenuState == MENU_STATES.GALAXY">GALAXY</div>
    <div v-if="currentMenuState == MENU_STATES.INTEL">INTEL</div>
    <div v-if="currentMenuState == MENU_STATES.OPTIONS">OPTIONS</div>
    <div v-if="currentMenuState == MENU_STATES.HELP">HELP</div>
    <div v-if="currentMenuState == MENU_STATES.INBOX">INBOX</div>
    
    <leaderboard v-if="currentMenuState == MENU_STATES.LEADERBOARD" :game="game"/>
    <player v-if="currentMenuState == MENU_STATES.PLAYER" :game="game" :player="currentMenuArguments" :key="currentMenuArguments._id"/>
</div>
</template>

<script>
import GameInfo from './GameInfo.vue';
import PlayerList from './PlayerList.vue';
import Leaderboard from '../leaderboard/Leaderboard.vue';
import Player from '../player/Player.vue';
import MENU_STATES from '../../data/menuStates';

export default {
    components: {
        'game-info': GameInfo,
        'player-list': PlayerList,
        'leaderboard': Leaderboard,
        'player': Player
    },
    props: {
        game: Object
    },
    data() {
        return {
            currentMenuState: null,
            currentMenuArguments: null,
            MENU_STATES: MENU_STATES
        };
    },
    methods: {
        resetMenuState() {
            this.currentMenuState = null;
            this.currentMenuArguments = null;
        },
        onMenuStateChanged(e) {
            this.currentMenuState = e.state || null;
            this.currentMenuArguments = e.args || null;
        },
        onPlayerSelected(player) {
            this.currentMenuState = MENU_STATES.PLAYER;
            this.currentMenuArguments = player;
        }
    }
}
</script>

<style scoped>
.menu {
    position:absolute; /* This is a must otherwise the div overlays the map */
    width: 473px;
}

@media(max-width: 473px) {
    .menu {
        width: 100%;
    }
}
</style>
