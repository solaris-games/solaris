<template>
<div class="container bg-secondary">
    <h3>{{player.alias}}</h3>

    <achievements />
</div>
</template>

<script>
import Achievements from './Achievements';
import apiService from '../../../services/apiService';

export default {
    components: {
        'achievements': Achievements
    },
    props: {
        game: Object,
        player: Object,
        user: Object
    },
    async mounted() {
        // If there is a legit user associated with this user then get the
        // user info so we can show more info like achievements.
        if (this.player.userId) {
            try {
                let response = await apiService.getUserInfo(this.player.userId);

                this.user = response.data;

                console.log(this.user);
            } catch(err) {
                console.error(err);
            }
        }
    }
}
</script>

<style scoped>
</style>
