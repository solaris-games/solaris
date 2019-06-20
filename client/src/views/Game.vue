<template>
    <div>
        <span class="d-none">{{ game._id}}</span>
        <main-bar v-bind:game="game"/>
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
        try {
            let response = await apiService.getGameInfo(this.$route.query.id);

            this.game = response.data; // This will be passed to the game container component.
        } catch(err) {
            console.error(err);
        }
    }
}
</script>

<style scoped>
</style>
