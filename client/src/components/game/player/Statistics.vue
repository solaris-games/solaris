<template>
<div class="table-responsive mb-0">
  <table class="table table-sm bg-secondary">
      <thead>
          <tr>
              <th></th>
              <th v-if="!isUserPlayer()"></th>
              <th v-if="userIsInGame()" class="text-center">You</th>
          </tr>
      </thead>
      <tbody>
          <tr>
              <td>Total Stars</td>
              <td class="text-center">{{player.stats.totalStars}}</td>
              <td class="text-center" v-if="userIsInGame() && !isUserPlayer()">{{getUserPlayer().stats.totalStars}}</td>
          </tr>
          <tr>
              <td>Total Carriers</td>
              <td class="text-center">{{player.stats.totalCarriers}}</td>
              <td class="text-center" v-if="userIsInGame() && !isUserPlayer()">{{getUserPlayer().stats.totalCarriers}}</td>
          </tr>
          <tr>
              <td>Total Ships</td>
              <td class="text-center">{{player.stats.totalShips}}</td>
              <td class="text-center" v-if="userIsInGame() && !isUserPlayer()">{{getUserPlayer().stats.totalShips}}</td>
          </tr>
          <tr>
              <td>New Ships</td>
              <td class="text-center">{{player.stats.newShips}}</td>
              <td class="text-center" v-if="userIsInGame() && !isUserPlayer()">{{getUserPlayer().stats.newShips}}</td>
          </tr>
      </tbody>
  </table>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'

export default {
  props: {
    player: Object
  },
  methods: {
    isUserPlayer () {
      let userPlayer = this.getUserPlayer()

      return userPlayer && userPlayer._id === this.player._id
    },
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    userIsInGame () {
      return this.getUserPlayer() != null
    }
  }
}
</script>
