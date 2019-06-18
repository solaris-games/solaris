<template>
<div>
    <player-list v-bind:players="game.galaxy.players"/>
</div>
</template>

<script>
import PlayerList from './PlayerList.vue';

export default {
    components: {
        'player-list': PlayerList
    },
    props: {
        game: Object
    }
}
</script>

<style scoped>
</style>
