<template>
    <ul class="list-group list-group-horizontal">
        <li class="list-group-item grow" v-for="p in players" v-bind:key="p._id" v-on:click="onOpenPlayerDetailRequested(p)"
          :title="p.colour.alias + ' - ' + p.alias">
            <!-- TODO: Prefer images over font awesome icons? -->
            <i class="far fa-user pl-2 pr-2 pt-2 pb-2 img" style="font-size:30px;"></i>
            <!-- <img src=""> -->

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
img {
    width: 60px;
    height: 60px;
}

.list-group-item {
    padding: 0;
    border: 0;
    overflow:hidden;
    cursor: pointer;
    border-radius: 0 !important;
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
