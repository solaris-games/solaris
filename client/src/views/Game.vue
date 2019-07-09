<template>
    <div v-if="game">
        <span class="d-none">{{ game._id}}</span>
        <main-bar v-bind:game="game" @onGameJoined="reloadGame"/>
        <game-container v-bind:game="game"/>
    </div>
</template>

<script>
import GameContainer from "../components/game/GameContainer.vue";
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
            game: null
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
        }
    }
}
</script>

<style scoped>
</style>
