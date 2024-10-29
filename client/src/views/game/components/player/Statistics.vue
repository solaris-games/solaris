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
          <statistic-row :playerId="playerId"
                         header="Stars"
                         scanningRangeTooltip="This figure is based on the stars in your scanning range."
                         :playerStat="player.stats.totalStars"
                         :userPlayerStat="userPlayer?.stats.totalStars">
          </statistic-row>
          <statistic-row v-if="isConquestHomeStars"
                         :playerId="playerId"
                         header="Capitals"
                         scanningRangeTooltip="This figure is based on the capitals in your scanning range."
                         :playerStat="player.stats.totalHomeStars"
                         :userPlayerStat="userPlayer?.stats.totalHomeStars">
          </statistic-row>
          <statistic-row :playerId="playerId"
                         header="Carriers"
                         scanningRangeTooltip="This figure is based on the carriers in your scanning range."
                         :playerStat="player.stats.totalCarriers"
                         :userPlayerStat="userPlayer?.stats.totalCarriers">
          </statistic-row>
          <statistic-row  v-if="isSpecialistsEnabled"
                         :playerId="playerId"
                         header="Specialists"
                         scanningRangeTooltip="This figure is based on the specialists in your scanning range."
                         :playerStat="player.stats.totalSpecialists"
                         :userPlayerStat="userPlayer?.stats.totalSpecialists">
          </statistic-row>
          <statistic-row :playerId="playerId"
                         header="Ships"
                         scanningRangeTooltip="This figure is based on the ships in your scanning range."
                         :playerStat="player.stats.totalShips"
                         :userPlayerStat="userPlayer?.stats.totalShips"
                         :formatFunction="formatTotalShipsValue">
          </statistic-row>
          <statistic-row :playerId="playerId"
                         header="New Ships"
                         scanningRangeTooltip="This figure is based on the stars in your scanning range."
                         :playerStat="player.stats.newShips"
                         :userPlayerStat="userPlayer?.stats.newShips">
          </statistic-row>
          <statistic-row :playerId="playerId"
                         header="Cycle Income"
                         scanningRangeTooltip="This figure is based on the stars in your scanning range."
                         :playerStat="playerIncome"
                         :userPlayerStat="userPlayerIncome"
                         :formatFunction="formatCreditsValue">
          </statistic-row>
          <statistic-row v-if="playerTickIncome > 0 || userPlayerTickIncome > 0"
                         :playerId="playerId"
                         header="Tick Income"
                         scanningRangeTooltip="This figure is based on the Financial Analysts in your scanning range."
                         :playerStat="playerTickIncome"
                         :userPlayerStat="userPlayerTickIncome"
                         :formatFunction="formatCreditsValue"
                         :isPlayerStatAlwaysUncertain="true">
          </statistic-row>
      </tbody>
  </table>

  <p class="text-warning text-center mb-2" v-if="isDarkModeExtra && userIsInGame() && !isUserPlayer()"><small>Based on your scanning range.</small></p>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import StatisticRow from './StatisticRow.vue'

export default {
  components: {
    'statistic-row': StatisticRow,
  },
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
    },
    formatCreditsValue: function (player, value) {
      return `$${value}`;
    },
    formatTotalShipsValue: function (player, value) {
      if (player.stats.totalShipsMax != null) {
        return `${value}/${player.stats.totalShipsMax}`
      }

      return value;
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
      return this.userPlayer != null ? GameHelper.calculateIncome(this.$store.state.game, this.userPlayer) : null
    },
    playerTickIncome() {
      return GameHelper.calculateTickIncome(this.$store.state.game, this.player)
    },
    userPlayerTickIncome() {
      return this.userPlayer != null ? GameHelper.calculateTickIncome(this.$store.state.game, this.userPlayer) : null;
    },
    isDarkModeExtra() {
      return GameHelper.isDarkModeExtra(this.$store.state.game);
    }
  }
}
</script>

<style scoped>
.table-sm th {
  padding: 0;
}
</style>
