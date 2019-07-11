<template>
<div>
    <div class="row" :style="{'background-color':player.colour.value.replace('0x', '#')}">
        <div class="col">
            <h4 class="pt-2">{{player.alias}}</h4>
        </div>
    </div>

    <div class="row">
        <div class="col-auto">
            <div class="row col pl-0 pr-0">
                <img src="../../../assets/avatars/0.jpg">
            </div>
            <div class="row bg-primary">
                <div class="col pt-2 pb-2">
                    <button class="btn btn-primary"><i class="fas fa-envelope"></i></button>
                    <button class="btn btn-info ml-1"><i class="fas fa-chart-line"></i></button>
                </div>
            </div>
        </div>
        <div class="col pr-0">
            <table class="table table-sm mb-0">
                <thead>
                    <tr>
                        <th></th>
                        <th v-if="!isUserPlayer()"></th>
                        <th class="text-center">You</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Total Stars</td>
                        <td class="text-center">{{getStarCount()}}</td>
                        <td class="text-center" v-if="!isUserPlayer()">{{getMyStarCount()}}</td>
                    </tr>
                    <tr>
                        <td>Total Carriers</td>
                        <td class="text-center">{{getCarrierCount()}}</td>
                        <td class="text-center" v-if="!isUserPlayer()">{{getMyCarrierCount()}}</td>
                    </tr>
                    <tr>
                        <td>Total Ships</td>
                        <td class="text-center">{{getShipsCount()}}</td>
                        <td class="text-center" v-if="!isUserPlayer()">{{getMyShipsCount()}}</td>
                    </tr>
                    <tr>
                        <td>New Ships</td>
                        <td class="text-center">0</td>
                        <td class="text-center" v-if="!isUserPlayer()">0</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
</template>

<script>
export default {
    props: {
        game: Object,
        player: Object
    },
    methods: {
        isUserPlayer() {
            return this.getUserPlayer()._id === this.player._id;
        },
        getUserPlayer() {
            return this.game.galaxy.players.find(x => x.userId === this.$store.state.userId);
        },
        getUserStars() {
            let userPlayer = this.getUserPlayer();

            if (!userPlayer) {
                return [];
            }

            return this.game.galaxy.stars.filter(x => x.ownedByPlayerId === userPlayer._id);
        },
        getUserCarriers() {
            let userPlayer = this.getUserPlayer();

            if (!userPlayer) {
                return [];
            }

            return userPlayer.carriers;
        },

        getStarCount() {
            return this.game.galaxy.stars.filter(x => x.ownedByPlayerId === this.player._id).length;
        },
        getMyStarCount() {
            return this.getUserStars().length;
        },
        getCarrierCount() {
            return this.player.carriers.length;
        },
        getMyCarrierCount() {
            return this.getUserCarriers().length;
        },
        getShipsCount() {
            let starGarrison = this.game.galaxy.stars.filter(x => x.ownedByPlayerId === this.player._id)
                                                        .reduce((sum, s) => sum += s.garrison || 0, 0);
                    
            let carrierGarrison = this.player.carriers.reduce((sum, s) => sum += s.ships, 0);

            return starGarrison + carrierGarrison;
        },
        getMyShipsCount() {
            let starGarrison = this.getUserStars().reduce((sum, s) => sum += s.garrison || 0, 0);
            let carrierGarrison = this.getUserCarriers().reduce((sum, s) => sum += s.ships, 0);

            return starGarrison + carrierGarrison;
        }
    }
}
</script>

<style scoped>
img {
    width: 160px;
    height: 160px;
}
</style>
