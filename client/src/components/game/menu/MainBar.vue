<template>
<div>
    <game-info v-bind:credits="500" v-bind:nextProduction="new Date().setHours(new Date().getHours() + 1)" @onMenuStateChanged="onMenuStateChanged"/>

    <player-list v-bind:players="game.galaxy.players"/>

    <div v-if="currentMenuState == MENU_STATES.LEADERBOARD">LEADERBOARD</div>
    <div v-if="currentMenuState == MENU_STATES.RESEARCH">RESEARCH</div>
    <div v-if="currentMenuState == MENU_STATES.GALAXY">GALAXY</div>
    <div v-if="currentMenuState == MENU_STATES.INTEL">INTEL</div>
    <div v-if="currentMenuState == MENU_STATES.OPTIONS">OPTIONS</div>
    <div v-if="currentMenuState == MENU_STATES.HELP">HELP</div>
    <div v-if="currentMenuState == MENU_STATES.INBOX">INBOX</div>
</div>
</template>

<script>
import GameInfo from './GameInfo.vue';
import PlayerList from './PlayerList.vue';
import MENU_STATES from '../../data/menuStates';

export default {
    components: {
        'game-info': GameInfo,
        'player-list': PlayerList
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
        onMenuStateChanged(e) {
            this.currentMenuState = e.state || null;
            this.currentMenuArguments = e.args || null;
        }
    }
}
</script>

<style scoped>
div {
    width: 480px;
}
</style>
