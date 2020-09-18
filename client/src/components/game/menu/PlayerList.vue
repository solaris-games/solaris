<template>
    <ul class="list-group list-group-horizontal">
        <li class="list-group-item grow" v-for="p in players" v-bind:key="p._id" v-on:click="onOpenPlayerDetailRequested(p)"
          :title="p.colour.alias + ' - ' + p.alias">
          <div class="player-icon text-center">
            <img v-if="p.avatar" :src="getAvatarImage(p)">
            <i v-if="!p.avatar" class="far fa-user ml-2 mr-2 mt-2 mb-2" style="font-size:44px;"></i>
            <i v-if="p.userId" class="userIcon fas fa-user"></i>
            <i v-if="showMedals && isFirstPlace(p)" class="medalIcon gold fas fa-medal"></i>
            <i v-if="showMedals && isSecondPlace(p)" class="medalIcon silver fas fa-medal"></i>
            <i v-if="showMedals && isThirdPlace(p)" class="medalIcon bronze fas fa-medal"></i>
          </div>

          <div class="colour-bar" v-bind:style="{'background-color':getFriendlyColour(p.colour.value)}">
          </div>
        </li>
    </ul>
</template>

<script>
import gameHelper from '../../../services/gameHelper'

export default {
  props: {
    players: Array
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
    onOpenPlayerDetailRequested (player) {
      this.$emit('onOpenPlayerDetailRequested', player._id)
    },
    getAvatarImage (player) {
      return require(`../../../assets/avatars/${player.avatar}.png`)
    },
    isFirstPlace (player) {
      let position = this.leaderboard.indexOf(player)

      return position === 0
    },
    isSecondPlace (player) {
      let position = this.leaderboard.indexOf(player)

      return position === 1
    },
    isThirdPlace (player) {
      let position = this.leaderboard.indexOf(player)

      return position === 2
    }
  }
}
</script>

<style scoped>
.player-icon, img {
    width: 60px;
    height: 60px;
}

.player-icon .userIcon {
  position: absolute;
  left: 3px;
  top: 40px;
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

.list-group-item {
    padding: 0;
    border: 0;
    overflow:hidden;
    cursor: pointer;
    border-radius: 0 !important;
    height: 68px;
    width: 60px;
}

.colour-bar {
    min-height: 8px;
}

ul {
  overflow: visible;
  white-space: nowrap;
}

li {
  display: inline-block;
}

/* Track */
::-webkit-scrollbar-track {
  background: #303030;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #375a7f;
}

.grow .colour-bar { transition: all .1s linear; }
.grow:hover .colour-bar {
  transform: scale(1.5);
  transform-origin: bottom;
}
</style>
