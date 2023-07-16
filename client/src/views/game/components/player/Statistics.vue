<template>
<div class="table-responsive mb-0" v-if="player">
  <table class="table table-sm  mb-1">
      <thead class="table-dark">
          <tr>
              <th></th>
              <th v-if="!isUserPlayer()"></th>
              <th v-if="userIsInGame()" class="text-end">You</th>
          </tr>
      </thead>
      <tbody>
          <tr>
              <td>Stars</td>
              <td class="text-end">{{player.stats.totalStars}}</td>
              <td class="text-end" v-if="userIsInGame() && !isUserPlayer()"
                :class="{'text-danger': player.stats.totalStars > userPlayer.stats.totalStars,
                          'text-success': player.stats.totalStars < userPlayer.stats.totalStars}">{{userPlayer.stats.totalStars}}</td>
          </tr>
          <tr v-if="isConquestHomeStars">
              <td>Capitals</td>
              <td class="text-end">{{player.stats.totalHomeStars}}</td>
              <td class="text-end" v-if="userIsInGame() && !isUserPlayer()"
                :class="{'text-danger': player.stats.totalHomeStars > userPlayer.stats.totalHomeStars,
                          'text-success': player.stats.totalHomeStars < userPlayer.stats.totalHomeStars}">{{userPlayer.stats.totalHomeStars}}</td>
          </tr>
          <tr>
              <td>Carriers</td>
              <td class="text-end">{{player.stats.totalCarriers}}</td>
              <td class="text-end" v-if="userIsInGame() && !isUserPlayer()"
                :class="{'text-danger': player.stats.totalCarriers > userPlayer.stats.totalCarriers,
                          'text-success': player.stats.totalCarriers < userPlayer.stats.totalCarriers}">{{userPlayer.stats.totalCarriers}}</td>
          </tr>
          <tr v-if="isSpecialistsEnabled">
              <td>Specialists</td>
              <td class="text-end">{{player.stats.totalSpecialists}}</td>
              <td class="text-end" v-if="userIsInGame() && !isUserPlayer()"
                :class="{'text-danger': player.stats.totalSpecialists > userPlayer.stats.totalSpecialists,
                          'text-success': player.stats.totalSpecialists < userPlayer.stats.totalSpecialists}">{{userPlayer.stats.totalSpecialists}}</td>
          </tr>
          <tr>
              <td>Ships</td>
              <td class="text-end">{{player.stats.totalShips}}<span v-if="player.stats.totalShipsMax">/{{player.stats.totalShipsMax}}</span></td>
              <td class="text-end" v-if="userIsInGame() && !isUserPlayer()"
                :class="{'text-danger': player.stats.totalShips > userPlayer.stats.totalShips,
                          'text-success': player.stats.totalShips < userPlayer.stats.totalShips}">{{userPlayer.stats.totalShips}}<span v-if="userPlayer.stats.totalShipsMax">/{{userPlayer.stats.totalShipsMax}}</span></td>
          </tr>
          <tr>
              <td>New Ships</td>
              <td class="text-end">{{player.stats.newShips}}</td>
              <td class="text-end" v-if="userIsInGame() && !isUserPlayer()"
                :class="{'text-danger': player.stats.newShips > userPlayer.stats.newShips,
                          'text-success': player.stats.newShips < userPlayer.stats.newShips}">{{userPlayer.stats.newShips}}</td>
          </tr>
          <tr>
            <td>Cycle Income</td>
            <td class="text-end">${{playerIncome}}</td>
            <td class="text-end" v-if="userIsInGame() && !isUserPlayer()"
              :class="{'text-danger': playerIncome > userPlayerIncome,
                        'text-success': playerIncome < userPlayerIncome}">${{userPlayerIncome}}</td>
          </tr>
      </tbody>
  </table>

  <p class="text-warning text-center mb-2" v-if="isDarkModeExtra && userIsInGame() && !isUserPlayer()"><small>Based on your scanning range.</small></p>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

export default {
  props: {
    playerId: String
  },
  methods: {
    isUserPlayer () {
      return this.userPlayer && this.userPlayer._id === this.player._id
    },
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    userIsInGame () {
      return this.userPlayer != null
    }
  },
  computed: {
    player () {
        return GameHelper.getPlayerById(this.$store.state.game, this.playerId)
    },
    userPlayer () {
        return GameHelper.getUserPlayer(this.$store.state.game)
    },
    isSpecialistsEnabled () {
      return GameHelper.isSpecialistsEnabled(this.$store.state.game)
    },
    isDarkModeExtra () {
      return GameHelper.isDarkModeExtra(this.$store.state.game)
    },
    isConquestHomeStars () {
      return GameHelper.isConquestHomeStars(this.$store.state.game)
    },
    playerIncome () {
      return GameHelper.calculateIncome(this.$store.state.game, this.player)
    },
    userPlayerIncome () {
      return GameHelper.calculateIncome(this.$store.state.game, this.userPlayer)
    }
  }
}
</script>

<style scoped>
.table-sm td, .table-sm th {
  padding: 0;
}
</style>
