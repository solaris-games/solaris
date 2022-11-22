<template>
<tr :class="{'defeated':technology.defeated}">
    <td><player-icon :playerId="technology._id"/></td>
    <td><a href="javascript:;" @click="onOpenPlayerDetailRequested">{{technology.alias}}</a></td>
    <td><a href="javascript:;" @click="goToEmpire"><i class="far fa-eye"></i></a></td>
    <td class="text-end">{{technology.scanning}}</td>
    <td class="text-end">{{technology.hyperspace}}</td>
    <td class="text-end">{{technology.terraforming}}</td>
    <td class="text-end">{{technology.experimentation}}</td>
    <td class="text-end">{{technology.weapons}}</td>
    <td class="text-end">{{technology.banking}}</td>
    <td class="text-end">{{technology.manufacturing}}</td>
    <td class="text-end">{{technology.specialists}}</td>
</tr>
</template>

<script>
import gameContainer from '../../../../game/container'
import PlayerIconVue from '../player/PlayerIcon'

export default {
  components: {
    'player-icon': PlayerIconVue
  },
  props: {
    technology: Object
  },
  methods: {
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', this.technology._id)
    },
    goToEmpire (e) {
      gameContainer.map.panToPlayer(this.$store.state.game, this.technology)
    }
  }
}
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}

.defeated {
  opacity: 0.5;
}
</style>
