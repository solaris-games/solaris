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
                        <td class="text-center">{{player.stats.totalStars}}</td>
                        <td class="text-center" v-if="!isUserPlayer()">{{getUserPlayer().stats.totalStars}}</td>
                    </tr>
                    <tr>
                        <td>Total Carriers</td>
                        <td class="text-center">{{player.stats.totalCarriers}}</td>
                        <td class="text-center" v-if="!isUserPlayer()">{{getUserPlayer().stats.totalCarriers}}</td>
                    </tr>
                    <tr>
                        <td>Total Ships</td>
                        <td class="text-center">{{player.stats.totalShips}}</td>
                        <td class="text-center" v-if="!isUserPlayer()">{{getUserPlayer().stats.totalShips}}</td>
                    </tr>
                    <tr>
                        <td>New Ships</td>
                        <td class="text-center">{{player.stats.newShips}}</td>
                        <td class="text-center" v-if="!isUserPlayer()">{{getUserPlayer().stats.newShips}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'

export default {
  props: {
    game: Object,
    player: Object
  },
  methods: {
    isUserPlayer () {
      return this.getUserPlayer()._id === this.player._id
    },
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.game, this.$store.state.userId)
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
