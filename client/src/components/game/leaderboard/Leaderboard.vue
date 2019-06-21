<template>
<div class="container bg-secondary">
    <h3 class="pt-2">Leaderboard</h3>

    <div class="row bg-primary">
        <div class="col">
            <h4 class="text-center mt-2">{{game.settings.general.name}}</h4>
        </div>
    </div>

    <div class="row">
        <div class="col text-center pt-2">
            <p class="mb-0">Be the first to capture {{game.galaxy.state.starsForVictory}} of {{game.galaxy.state.stars}} stars.</p>
            <p>Galactic Cycle {{game.galaxy.state.productionTick}} - Tick {{game.galaxy.state.tick}}</p>
        </div>
    </div>

    <div class="row">
        <table class="table table-sm table-striped">
            <tbody>
                <tr v-for="player in game.galaxy.players" :key="player._id">
                    <td :style="{'width': '8px', 'background-color':player.colour.value.replace('0x', '#')}"></td>
                    <td>
                        <img src="../../../assets/avatars/0.jpg">
                    </td>
                    <td>
                        <h5>{{player.alias}}</h5>
                    </td>
                    <td>0 Stars</td>
                    <td>
                        <button class="btn btn-info"><i class="fas fa-eye"></i></button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
</template>

<script>
export default {
    props: {
        game: Object
    }
}
</script>

<style scoped>
img {
    height: 48px;
    width: 48px;
}
</style>
