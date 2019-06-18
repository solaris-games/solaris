<template>
<div>
    <game-info v-bind:credits="500" v-bind:nextProduction="new Date().setHours(new Date().getHours() + 1)"/>
    <player-list v-bind:players="game.galaxy.players"/>
</div>
</template>

<script>
import GameInfo from './GameInfo.vue';
import PlayerList from './PlayerList.vue';

export default {
    components: {
        'game-info': GameInfo,
        'player-list': PlayerList
    },
    props: {
        game: Object
    }
}
</script>

<style scoped>
div {
    width: 480px;
}
</style>
