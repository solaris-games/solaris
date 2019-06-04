<template>
    <div>
        {{ game._id}}
    </div>
</template>

<script>
import apiService from '../services/apiService';

export default {
    components: {

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
        } catch(err) {
            console.error(err);
        }
    }
}
</script>

<style scoped>

</style>
