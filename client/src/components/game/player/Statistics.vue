<template>
<div class="table-responsive mb-0">
  <table class="table table-sm bg-secondary">
      <thead>
          <tr>
              <th></th>
              <th v-if="!isUserPlayer()"></th>
              <th v-if="userIsInGame()" class="text-right">You</th>
          </tr>
      </thead>
      <tbody>
          <tr>
              <td>Total Stars</td>
              <td class="text-right">{{player.stats.totalStars}}</td>
              <td class="text-right" v-if="userIsInGame() && !isUserPlayer()"
                :class="{'text-danger': player.stats.totalStars > userPlayer.stats.totalStars,
                          'text-success': player.stats.totalStars < userPlayer.stats.totalStars}">{{userPlayer.stats.totalStars}}</td>
          </tr>
          <tr>
              <td>Total Carriers</td>
              <td class="text-right">{{player.stats.totalCarriers}}</td>
              <td class="text-right" v-if="userIsInGame() && !isUserPlayer()"
                :class="{'text-danger': player.stats.totalCarriers > userPlayer.stats.totalCarriers,
                          'text-success': player.stats.totalCarriers < userPlayer.stats.totalCarriers}">{{userPlayer.stats.totalCarriers}}</td>
          </tr>
          <tr>
              <td>Total Ships</td>
              <td class="text-right">{{player.stats.totalShips}}</td>
              <td class="text-right" v-if="userIsInGame() && !isUserPlayer()"
                :class="{'text-danger': player.stats.totalShips > userPlayer.stats.totalShips,
                          'text-success': player.stats.totalShips < userPlayer.stats.totalShips}">{{userPlayer.stats.totalShips}}</td>
          </tr>
          <tr>
              <td>New Ships</td>
              <td class="text-right">{{player.stats.newShips}}</td>
              <td class="text-right" v-if="userIsInGame() && !isUserPlayer()"
                :class="{'text-danger': player.stats.newShips > userPlayer.stats.newShips,
                          'text-success': player.stats.newShips < userPlayer.stats.newShips}">{{userPlayer.stats.newShips}}</td>
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
  data () {
    return {
      userPlayer: null
    }
  },
  mounted () {
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
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
  }
}
</script>
