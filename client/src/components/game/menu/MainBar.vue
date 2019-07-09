<template>
<div class="menu">
    <game-info v-bind:credits="500" v-bind:nextProduction="game.state.nextTickDate" @onMenuStateChanged="onMenuStateChanged"/>

    <player-list v-bind:players="game.galaxy.players" @onPlayerSelected="onPlayerSelected"/>

    <div v-if="currentMenuState == MENU_STATES.RESEARCH">RESEARCH</div>
    <div v-if="currentMenuState == MENU_STATES.GALAXY">GALAXY</div>
    <div v-if="currentMenuState == MENU_STATES.INTEL">INTEL</div>
    <div v-if="currentMenuState == MENU_STATES.OPTIONS">OPTIONS</div>
    <div v-if="currentMenuState == MENU_STATES.HELP">HELP</div>
    <div v-if="currentMenuState == MENU_STATES.INBOX">INBOX</div>
    
    <welcome v-if="currentMenuState == MENU_STATES.WELCOME" :game="game" v-on:onGameJoined="onGameJoined"/>
    <leaderboard v-if="currentMenuState == MENU_STATES.LEADERBOARD" :game="game"/>
    <player v-if="currentMenuState == MENU_STATES.PLAYER" :game="game" :player="currentMenuArguments" :key="currentMenuArguments._id"/>
</div>
</template>

<script>
import MENU_STATES from '../../data/menuStates';
import GameInfoVue from './GameInfo.vue';
import PlayerListVue from './PlayerList.vue';
import LeaderboardVue from '../leaderboard/Leaderboard.vue';
import PlayerVue from '../player/Player.vue';
import WelcomeVue from '../welcome/Welcome.vue';

export default {
    components: {
        'game-info': GameInfoVue,
        'welcome': WelcomeVue,
        'player-list': PlayerListVue,
        'leaderboard': LeaderboardVue,
        'player': PlayerVue
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
    mounted() {
        // Check if the user is in this game, if not then show the welcome screen.
        let thisPlayer = this.game.galaxy.players.find(x => x.userId === this.$store.state.userId);

        this.currentMenuState = thisPlayer ? 'leaderboard' : 'welcome';
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
        },
        onGameJoined() {
            this.currentMenuState = MENU_STATES.LEADERBOARD;
            this.currentMenuArguments = null;
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
