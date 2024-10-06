<template>
    <tr>
      <td>{{header}}</td>
      <td class="text-end" :title="isPlayerStatUncertain ? scanningRangeTooltip : null">{{formatValue(player, playerStat)}}{{ isPlayerStatUncertain ? '?' : ''}}</td>
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
      if (this.userPlayer) {
        return false
      }

      return this.player.hasPerspective || false;
    },
    isPlayerStatUncertain() {
      // The stat is uncertain if all of the following are true:
      // * the game is unfinished
      // * the user does not have perspective of the other player (ie they're not spectating them)
      //     - (hasPerspective will be false if the user is a player in the game even if the other player has added them as a spectator.)
      // * the stat is marked to always be uncertain, or we're in extra dark
      // * the user is not the player.
      return !GameHelper.isGameFinished(this.$store.state.game)
        && !this.hasPerspective
        && (this.isPlayerStatAlwaysUncertain || this.isDarkModeExtra)
        && !this.isUserPlayer();
    }
  }
}
</script>

<style scoped>
  td {
    padding: 0;
  }
</style>
