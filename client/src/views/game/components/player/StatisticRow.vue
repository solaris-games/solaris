<template>
    <tr>
      <td>{{header}}</td>
      <td class="text-end" :title="(isPlayerStatAlwaysUncertain || isDarkModeExtra) && !isUserPlayer() ? scanningRangeTooltip : null">{{formatValue(player, playerStat)}}{{ !hasPerspective && (isPlayerStatAlwaysUncertain || isDarkModeExtra) && !isUserPlayer() ? '?' : ''}}</td>
      <td class="text-end" v-if="userIsInGame() && !isUserPlayer()"
        :class="{'text-danger': playerStat > userPlayerStat,
                  'text-success': playerStat < userPlayerStat}">{{formatValue(userPlayer, userPlayerStat)}}</td>
    </tr>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

export default {
  props: {
    playerId: {
      type: String,
      required: true
    },
    header: {
      type: String,
      required: true
    },
    scanningRangeTooltip: {
      type: String,
      required: true
    },
    isPlayerStatAlwaysUncertain: {
      type: Boolean,
      required: false
    },
    playerStat: {
      type: Number,
      required: true
    },
    userPlayerStat: {
      type: Number,
      required: false
    },
    formatFunction: {
      type: Function
    }
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
    formatValue(player, value) {
      if (this.formatFunction != null) {
        return this.formatFunction(player, value);
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
      return GameHelper.calculateIncome(this.$store.state.game, this.userPlayer)
    },
    playerTickIncome() {
      return GameHelper.calculateTickIncome(this.$store.state.game, this.player)
    },
    userPlayerTickIncome() {
      return GameHelper.calculateTickIncome(this.$store.state.game, this.userPlayer)
    },
    isDarkModeExtra() {
      return GameHelper.isDarkModeExtra(this.$store.state.game);
    },
    hasPerspective() {
      if (GameHelper.getUserPlayer(this.$store.state.game)) {
        return false
      }

      return this.player.hasPerspective || false;
    }
  }
}
</script>

<style scoped>
  td {
    padding: 0;
  }
</style>
