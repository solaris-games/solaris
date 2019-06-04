<template>
    <div>
        {{ game._id}}
        <game-container/>
    </div>
</template>

<script>
import GameContainer from "../components/GameContainer.vue";
import apiService from '../services/apiService';
import map from '../game/map';

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

            this.game = response.data;

            map.draw(this.game);
        } catch(err) {
            console.error(err);
        }
    }
}
</script>

<style scoped>

</style>
