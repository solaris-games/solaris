<template>
    <div v-if="game">
        <span class="d-none">{{ game._id}}</span>
        
        <main-bar :game="game" 
                    :menuState="menuState"
                    :menuArguments="menuArguments"
                    @onMenuStateChanged="onMenuStateChanged"
                    @onGameJoined="reloadGame"
                    @onPlayerSelected="onPlayerSelected"/>

        <game-container :game="game"
                    @onStarClicked="onStarClicked"/>
    </div>
</template>

<script>
import GameContainer from "../components/game/GameContainer.vue";
import MENU_STATES from '../components/data/menuStates';
import MainBar from '../components/game/menu/MainBar.vue';
import apiService from '../services/apiService';
import Map from '../game/map';

export default {
    components: {
        'game-container': GameContainer,
        'main-bar': MainBar
    },
    data() {
        return {
            game: null,
            menuState: null,
            menuArguments: null,
            MENU_STATES: MENU_STATES
        }
    },
    async mounted() {
        this.reloadGame();
    },
    methods: {
        async reloadGame() {
            try {
                let infoResponse = await apiService.getGameInfo(this.$route.query.id);
                let galaxyResponse = await apiService.getGameGalaxy(this.$route.query.id);

                this.game = infoResponse.data; // This will be passed to the game container component.
                this.game.galaxy = galaxyResponse.data.galaxy;
            } catch(err) {
                console.error(err);
            }
        },

        // MENU

        resetMenuState() {
            this.menuState = null;
            this.menuArguments = null;
        },
        onMenuStateChanged(e) {
            this.menuState = e.state || null;
            this.menuArguments = e.args || null;

            this.$emit('onMenuStateChanged', e);
        },

        onGameJoined(e) {
            this.menuState = MENU_STATES.LEADERBOARD;
            this.menuArguments = null;
            
            this.$emit('onGameJoined', e);
        },
        onPlayerSelected(e) {
            this.menuState = MENU_STATES.PLAYER;
            this.menuArguments = e;

            this.$emit('onPlayerSelected', e);
        },
        onStarClicked(e) {
            this.menuState = MENU_STATES.STAR_DETAIL;
            this.menuArguments = e;

            this.$emit('onStarClicked', e);
        },

        // --------------------
    }
}
</script>

<style scoped>
</style>
