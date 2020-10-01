<template>
<div class="menu-page">
    <div class="container">
        <menu-title title="Select Object" @onCloseRequested="onCloseRequested"/>
    </div>

    <div class="table-responsive">
        <table class="table mb-0">
            <tbody>
                <tr v-for="mapObject in mapObjects" :key="mapObject._id">
                    <td :style="{'padding': '0', 'width': '8px', 'background-color': getFriendlyColour(mapObject)}"></td>
                    <td v-if="mapObject.type === 'star'" class="col-auto text-center">
                        <h5><i class="fas fa-star"></i></h5>
                    </td>
                    <td v-if="mapObject.type === 'carrier'" class="col-auto text-center">
                        <h5><i class="fas fa-rocket"></i></h5>
                    </td>
                    <td v-if="mapObject.type === 'star'" class="bg-secondary text-center">
                        <span>{{mapObject.data.garrison == null ? '???' : mapObject.data.garrison}}</span>
                    </td>
                    <td v-if="mapObject.type === 'carrier'" class="bg-secondary text-center">
                        <span>{{mapObject.data.ships == null ? '???' : mapObject.data.ships}}</span>
                    </td>
                    <td>
                        <span>{{mapObject.data.name}}</span>
                    </td>
                    <td class="text-right">
                        <span v-if="mapObject.type === 'carrier'">
                          <i class="fas fa-map-marker-alt"></i>
                          <i class="fas fa-sync ml-1" v-if="mapObject.data.waypointsLooped"></i>
                          {{mapObject.data.waypoints.length}}</span>
                    </td>
                    <td class="text-right" style="width:30%;">
                        <!-- <button type="button" class="btn btn-primary"><i class="fas fa-chevron-up"></i></button>
                        <button type="button" class="btn btn-primary"><i class="fas fa-chevron-down"></i></button>
                        <button v-if="mapObject.type === 'star' && mapObject.data.garrison" type="button" class="btn btn-primary"><i class="fas fa-rocket"></i></button> -->
                        <button v-if="mapObject.type === 'carrier' && userOwnsObject(mapObject) && !getObjectOwningPlayer(mapObject).defeated && !mapObject.data.isGift" type="button" class="btn btn-primary ml-1" @click="onEditWaypointsRequested(mapObject)"><i class="fas fa-plus"></i></button>
                        <button type="button" class="btn btn-primary ml-1" @click="onViewObjectRequested(mapObject)">View</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
</template>

<script>
import gameHelper from '../../../services/gameHelper'
import gameContainer from '../../../game/container'
import MenuTitleVue from '../MenuTitle'

export default {
  components: {
    'menu-title': MenuTitleVue
  },
  props: {
    mapObjects: Array
  },
  methods: {
    userOwnsObject (mapObject) {
      let userPlayer = gameHelper.getUserPlayer(this.$store.state.game)

      switch (mapObject.type) {
        case 'star':
          return gameHelper.getStarOwningPlayer(this.$store.state.game, mapObject.data)._id === userPlayer._id
        case 'carrier':
          return gameHelper.getCarrierOwningPlayer(this.$store.state.game, mapObject.data)._id === userPlayer._id
      }
    },
    getObjectOwningPlayer (mapObject) {
      switch (mapObject.type) {
        case 'star':
          return gameHelper.getStarOwningPlayer(this.$store.state.game, mapObject.data)
        case 'carrier':
          return gameHelper.getCarrierOwningPlayer(this.$store.state.game, mapObject.data)
      }
    },
    getFriendlyColour (mapObject) {
      let owningPlayer

      switch (mapObject.type) {
        case 'star':
          owningPlayer = gameHelper.getStarOwningPlayer(this.$store.state.game, mapObject.data)
          break
        case 'carrier':
          owningPlayer = gameHelper.getCarrierOwningPlayer(this.$store.state.game, mapObject.data)
          break
      }

      if (!owningPlayer) {
        return ''
      }

      return gameHelper.getFriendlyColour(owningPlayer.colour.value)
    },
    onViewObjectRequested (mapObject) {
      switch (mapObject.type) {
        case 'star':
          gameContainer.map.clickStar(mapObject.data._id)
          this.$emit('onOpenStarDetailRequested', mapObject.data._id)
          break
        case 'carrier':
          gameContainer.map.clickCarrier(mapObject.data._id)
          this.$emit('onOpenCarrierDetailRequested', mapObject.data._id)
          break
      }
    },
    onEditWaypointsRequested (mapObject) {
      this.$emit('onEditWaypointsRequested', mapObject.data._id)
    },
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    }
  }
}
</script>

<style scoped>
td {
  vertical-align: middle !important;
}
</style>
