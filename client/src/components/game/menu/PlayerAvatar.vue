<template>
    <div class="player-icon text-center">
        <img v-if="player.avatar" :src="getAvatarImage()" :class="{'defeated-player': player.defeated}">
        <i v-if="!player.avatar" class="far fa-user ml-2 mr-2 mt-2 mb-2" style="font-size:44px;"></i>
        <i v-if="canShowShapeIcon"
            class="shapeIcon far"
            :class="{'fa-circle': player.shape === 'circle','fa-square': player.shape === 'square'}"
            :style="{'color': getFriendlyColour(player.colour.value)}"></i>
        <i v-if="player.userId" class="userIcon fas fa-user"></i>
        <i v-if="showMedals && isFirstPlace()" class="medalIcon gold fas fa-medal"></i>
        <i v-if="showMedals && isSecondPlace()" class="medalIcon silver fas fa-medal"></i>
        <i v-if="showMedals && isThirdPlace()" class="medalIcon bronze fas fa-medal"></i>
    </div>
</template>

<script>
import gameHelper from '../../../services/gameHelper'

export default {
  props: {
    player: Object
  },
  data () {
    return {
      leaderboard: null,
      showMedals: false
    }
  },
  mounted () {
    this.leaderboard = gameHelper.getSortedLeaderboardPlayerList(this.$store.state.game)
    this.showMedals = gameHelper.isGameInProgress(this.$store.state.game) || gameHelper.isGameFinished(this.$store.state.game)
  },
  methods: {
    getFriendlyColour (colour) {
      return gameHelper.getFriendlyColour(colour)
    },
    getAvatarImage () {
      return require(`../../../assets/avatars/${this.player.avatar}.png`)
    },
    isFirstPlace () {
      let position = this.leaderboard.indexOf(this.player)

      return position === 0
    },
    isSecondPlace () {
      let position = this.leaderboard.indexOf(this.player)

      return position === 1
    },
    isThirdPlace () {
      let position = this.leaderboard.indexOf(this.player)

      return position === 2
    },
    canShowShapeIcon () {
      return gameHelper.getGamePlayerShapesCount(this.$store.state.game) > 1
    }
  }
}
</script>

<style scoped>
.player-icon, img {
    width: 59px;
    height: 59px;
}

.player-icon .userIcon {
  position: absolute;
  left: 3px;
  top: 40px;
  font-size:16px;
}

.player-icon .shapeIcon {
  position: absolute;
  left: 40px;
  top: 3px;
  font-size:16px;
}

.player-icon .medalIcon {
  position: absolute;
  left: 40px;
  top: 40px;
  font-size:16px;
}

.gold {
  color: gold;
}

.silver {
  color: silver;
}

.bronze {
  color: #b08d57;
}

.defeated-player {
  opacity: 0.3;
}
</style>
