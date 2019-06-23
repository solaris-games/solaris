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
                    <td class="col-avatar">
                        <img src="../../../assets/avatars/0.jpg">
                    </td>
                    <td class="pl-2 pt-3 pb-2">
                        <h5 style="vertical-align: middle;">{{player.alias}}</h5>
                    </td>
                    <td class="fit pt-3 pr-2">
                        <span>0 Stars</span>
                    </td>
                    <td class="fit pt-2 pb-2 pr-2">
                        <button class="btn btn-info" @click="zoomToPlayer(player)"><i class="fas fa-eye"></i></button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
</template>

<script>
import Map from '../../../game/map';

export default {
    props: {
        game: Object
    },
    methods: {
        zoomToPlayer(player) {
            Map.zoomToPlayer(this.game, player);
        }
    }
}
</script>

<style scoped>
img {
    height: 48px;
    width: 48px;
}

.col-avatar {
    width: 48px;
}

.table-sm td {
    padding: 0;
}

.table td.fit, 
.table th.fit {
    white-space: nowrap;
    width: 1%;
}
</style>
