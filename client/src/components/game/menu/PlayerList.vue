<template>
    <ul class="list-group list-group-horizontal">
        <li class="list-group-item grow" v-for="p in players" v-bind:key="p._id" v-on:click="onOpenPlayerDetailRequested(p)"
          :title="p.colour.alias + ' - ' + p.alias">
          <player-avatar :player="p"/>

          <div class="colour-bar" v-bind:style="{'background-color':getFriendlyColour(p.colour.value)}">
          </div>
        </li>
    </ul>
</template>

<script>
import gameHelper from '../../../services/gameHelper'
import PlayerAvatarVue from './PlayerAvatar'

export default {
  components: {
    'player-avatar': PlayerAvatarVue
  },
  props: {
    players: Array
  },
  methods: {
    getFriendlyColour (colour) {
      return gameHelper.getFriendlyColour(colour)
    },
    onOpenPlayerDetailRequested (player) {
      this.$emit('onOpenPlayerDetailRequested', player._id)
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

ul {
  overflow: visible;
  white-space: nowrap;
  overflow-x: auto;
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
