<template>
    <div>
        {{ game._id}}
        <game-container v-bind:game="game"/>
    </div>
</template>

<script>
import GameContainer from "../components/GameContainer.vue";
import apiService from '../services/apiService';
import Map from '../game/map';

export default {
    components: {
        'game-container': GameContainer
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
