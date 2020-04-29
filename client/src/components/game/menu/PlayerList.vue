<template>
    <ul class="list-group list-group-horizontal">
        <li class="list-group-item" v-for="p in players" v-bind:key="p._id" v-on:click="onPlayerSelected(p)">

            <!-- TODO: Prefer images over font awesome icons? -->
            <i class="far fa-user pl-2 pr-2 pt-2 pb-2 img" style="font-size:50px;"></i>
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
    onPlayerSelected (player) {
      this.$emit('onPlayerSelected', player)
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
}

.colour-bar {
    min-height: 8px;
}

ul {
  overflow: auto;
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
</style>
