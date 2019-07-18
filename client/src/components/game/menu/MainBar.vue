<template>
<div class="menu">
    <game-info v-bind:credits="500" v-bind:nextProduction="game.state.nextTickDate" @onMenuStateChanged="onMenuStateChanged"/>

    <player-list v-bind:players="game.galaxy.players" @onPlayerSelected="onPlayerSelected"/>

    <div v-if="menuState == MENU_STATES.GALAXY">GALAXY</div>
    <div v-if="menuState == MENU_STATES.INTEL">INTEL</div>
    <div v-if="menuState == MENU_STATES.OPTIONS">OPTIONS</div>
    <div v-if="menuState == MENU_STATES.HELP">HELP</div>
    <div v-if="menuState == MENU_STATES.INBOX">INBOX</div>
    
    <welcome v-if="menuState == MENU_STATES.WELCOME" :game="game" v-on:onGameJoined="onGameJoined"/>
    <leaderboard v-if="menuState == MENU_STATES.LEADERBOARD" :game="game"/>
    <player v-if="menuState == MENU_STATES.PLAYER" :game="game" :player="menuArguments" :key="menuArguments._id"/>
    <research v-if="menuState == MENU_STATES.RESEARCH"/>
    <star-detail v-if="menuState == MENU_STATES.STAR_DETAIL" :game="game" :star="menuArguments"/>
</div>
</template>

<script>
import MENU_STATES from '../../data/menuStates';
import GameInfoVue from './GameInfo.vue';
import PlayerListVue from './PlayerList.vue';
import LeaderboardVue from '../leaderboard/Leaderboard.vue';
import PlayerVue from '../player/Player.vue';
import WelcomeVue from '../welcome/Welcome.vue';
import ResearchVue from '../research/Research.vue';
import StarDetailVue from '../star/StarDetail.vue';
import apiService from '../../../services/apiService';

export default {
    components: {
        'game-info': GameInfoVue,
        'welcome': WelcomeVue,
        'player-list': PlayerListVue,
        'leaderboard': LeaderboardVue,
        'player': PlayerVue,
        'research': ResearchVue,
        'star-detail': StarDetailVue
    },
    props: {
        game: Object,
        menuState: String,
        menuArguments: Object
    },
    data() {
        return {
            MENU_STATES: MENU_STATES
        };
    },
    mounted() {
        // Check if the user is in this game, if not then show the welcome screen.
        let userPlayer = this.game.galaxy.players.find(x => x.userId === this.$store.state.userId);

        this.menuState = userPlayer ? 'leaderboard' : 'welcome';
    },
    methods: {
        onMenuStateChanged(e) {
            this.$emit('onMenuStateChanged', e);
        },
        onPlayerSelected(e) {
            this.$emit('onPlayerSelected', e);
        },
        onGameJoined(e) {
            this.$emit('onGameJoined', e);
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
