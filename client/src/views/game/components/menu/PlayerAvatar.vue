<template>
  <div @click="onClick" class="player-icon text-center bg-dark">
    <img v-if="player.avatar" :src="getAvatarImage()" :class="{'defeated-player': player.defeated}">
    <i v-if="!player.avatar" class="far fa-user ms-2 me-2 mt-2 mb-2"></i>
    <span v-if="canShowShapeIcon()" class="shapeIcon">
      <player-icon :playerId="player._id"/>
    </span>
    <i v-if="player.userId" class="userIcon fas fa-user"></i>
    <i v-if="hasPerspective()" class="userIcon fas fa-eye"></i>
    <i v-if="showMedals && isFirstPlace()" class="medalIcon gold fas fa-medal"></i>
    <i v-if="showMedals && isSecondPlace()" class="medalIcon silver fas fa-medal"></i>
    <i v-if="showMedals && isThirdPlace()" class="medalIcon bronze fas fa-medal"></i>
  </div>
</template>

<script>
import gameHelper from '../../../../services/gameHelper'
import PlayerIconVue from '../player/PlayerIcon'

export default {
  components: {
    'player-icon': PlayerIconVue
  },
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
    getAvatarImage () {
      try {
        return require(`../../../../assets/avatars/${this.player.avatar}`)
      } catch (err) {
        console.error(err)
        
        return null
      }
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
      // return gameHelper.getGamePlayerShapesCount(this.$store.state.game) > 1
      return true
    },
    hasPerspective () {
      if (gameHelper.getUserPlayer(this.$store.state.game)) {
        return false
      }

      return this.player.hasPerspective || false
    },
    onClick () {
      this.$emit('onClick')
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

.fa-user {
  font-size: 44px;
}

.defeated-player {
  opacity: 0.3;
}

@media screen and (max-width: 576px) { 
  .player-icon, img {
      height: 35px;
      width: 35px;
  }

  .player-icon .userIcon {
    position: absolute;
    left: 1px;
    top: 22px;
    font-size:10px;
  }

  .player-icon .shapeIcon {
    position: absolute;
    left: 22px;
    top: 1px;
    font-size:10px;
  }

  .player-icon .medalIcon {
    position: absolute;
    left: 22px;
    top: 22px;
    font-size:10px;
  }

  .fa-user {
    font-size: 30px;
  }
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
</style>
