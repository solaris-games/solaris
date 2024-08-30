<template>
    <ul class="list-group list-group-horizontal">
        <li class="list-group-item grow" v-for="p in sortedPlayers" v-bind:key="p._id" v-on:click="onPlayerClicked(p)"
          :title="p.colour.alias + ' ' + p.shape + ' - ' + p.alias">
          <player-avatar :player="p"/>

          <div class="colour-bar" v-bind:style="{'background-color': getPlayerColour(p)}">
          </div>
        </li>
    </ul>
</template>

<script>
import gameHelper from '../../../../services/gameHelper'
import PlayerAvatarVue from './PlayerAvatar.vue'

export default {
  components: {
    'player-avatar': PlayerAvatarVue
  },
  methods: {
    getFriendlyColour (colour) {
      return gameHelper.getFriendlyColour(colour)
    },
    onPlayerClicked (player) {
      // dispatch click to the store to intercept it when adding the player name to a message
      this.$store.commit('playerClicked', {
        player,
        permitCallback: () => this.$emit('onOpenPlayerDetailRequested', player._id)
      })
    },
    getPlayerColour (player) {
      return this.$store.getters.getColourForPlayer(player._id).value
    }
  },
  computed: {
    sortedPlayers: function () {
      return gameHelper.getSortedLeaderboardPlayerList(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
.list-group-item {
    padding: 0;
    border: 0;
    overflow:hidden;
    cursor: pointer;
    border-radius: 0 !important;
    height: 68px;
    width: 59px;
    min-width: 59px;
}

.colour-bar {
    min-height: 8px;
}

@media screen and (max-width: 576px) {
  .list-group-item {
      height: 40px;
      width: 35px;
      min-width: 35px;
  }

  .colour-bar {
      min-height: 4px;
  }
}

ul {
  overflow: visible;
  white-space: nowrap;
  overflow-x: auto;
  scrollbar-color: #375a7f #303030;
}

li {
  display: inline-block;
}

.grow .colour-bar { transition: all .1s linear; }
.grow:hover .colour-bar {
  transform: scale(1.5);
  transform-origin: bottom;
}
</style>
