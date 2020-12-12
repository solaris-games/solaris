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
                    <td v-if="mapObject.type === 'star'" class="col-auto text-center" style="width:12.5%">
                        <specialist-icon :type="'star'" :specialist="mapObject.data.specialist" />
                    </td>
                    <td v-if="mapObject.type === 'carrier'" class="col-auto text-center" style="width:12.5%">
                        <specialist-icon :type="'carrier'" :specialist="mapObject.data.specialist" />
                    </td>
                    <td v-if="mapObject.type === 'star'" class="bg-secondary text-center" style="width:12.5%">
                        <span>{{mapObject.data.garrison == null ? '???' : mapObject.data.garrison}}</span>
                    </td>
                    <td v-if="mapObject.type === 'carrier'" class="bg-secondary text-center" style="width:12.5%">
                        <span>{{mapObject.data.ships == null ? '???' : mapObject.data.ships}}</span>
                    </td>
                    <td>
                        <span><a href="javascript:;" @click="onViewObjectRequested(mapObject)">{{mapObject.data.name}}</a></span>
                    </td>
                    <td class="text-right">
                        <span v-if="mapObject.type === 'carrier' && (userOwnsObject(mapObject) || mapObject.data.waypoints.length)">
                          <i class="fas fa-map-marker-alt"></i>
                          <i class="fas fa-sync ml-1" v-if="mapObject.data.waypointsLooped"></i>
                          {{mapObject.data.waypoints.length}}
                        </span>
                    </td>
                    <td v-if="userOwnsObject(mapObject)" class="text-right" style="">
                        <button title="Edit waypoints." v-if="mapObject.type === 'carrier' && !getObjectOwningPlayer(mapObject).defeated && !mapObject.data.isGift && !isGameFinished()" type="button" class="btn btn-primary  ml-1" @click="onEditWaypointsRequested(mapObject.data._id)">
                        <i class="fas fa-plus"></i> </button>
                        <button title="Create a carrier." v-if="mapObject.type === 'star' && mapObject.data.garrison && hasEnoughCredits(mapObject)" type="button" class="btn btn-primary  ml-1" @click="quickBuildCarrier(mapObject)"><i class="fas fa-rocket"></i></button>
                        <button title="Transfer all ships to the star." v-if="mapObject.type === 'star' " type="button" class="btn btn-primary  ml-1" @click="garrisonAllShips(mapObject)"><i class="fas fa-chevron-up"></i></button>
                        <button title="Transfer ships." v-if="mapObject.type === 'carrier' && !getObjectOwningPlayer(mapObject).defeated && !mapObject.data.isGift && !isGameFinished()" type="button" class="btn btn-primary  ml-1 " @click="onShipTransferRequested(mapObject)"><i class="fas fa-exchange-alt"></i></button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
</template>

<script>
import gameHelper from '../../../services/gameHelper'
import AudioService from '../../../game/audio'
import gameContainer from '../../../game/container'
import MenuTitleVue from '../MenuTitle'
import SpecialistIconVue from '../specialist/SpecialistIcon'
import starService from '../../../services/api/star'

export default {
  components: {
    'menu-title': MenuTitleVue,
    'specialist-icon': SpecialistIconVue
  },
  props: {
    mapObjects: Array
  },
  data () {
    return {
      audio: null,
      isStandardUIStyle: false,
      isCompactUIStyle: false
    }
  },
  mounted () {
    this.isStandardUIStyle = this.$store.state.settings.interface.uiStyle === 'standard'
    this.isCompactUIStyle = this.$store.state.settings.interface.uiStyle === 'compact'

  },
  methods: {
    hasEnoughCredits(mapObject) {
      let star = mapObject
      let userPlayer = gameHelper.getUserPlayer(this.$store.state.game)
      let availableCredits = userPlayer.credits
      return (availableCredits >= star.data.upgradeCosts.carriers)
    },
    async garrisonAllShips(star) {
      try {
        let response = await starService.garrisonAllShips(this.$store.state.game._id, star.data._id)
        if (response.status === 200) {
          this.$toasted.show(`All ships transfered to ${star.data.name}.`)
          let carriers = response.data.carriersAtStar
          carriers.forEach( responseCarrier => {
            let mapObjectCarrier = gameHelper.getCarrierById(responseCarrier._id) 
            mapObjectCarrier.data.garrison = responseCarrier.garrison
          })
          
        }
      } catch (err) {
        console.log(err)
      }
    },
    async quickBuildCarrier (star) {
      try {
        // Build the carrier with the entire star garrison.
        let ships = star.data.garrison

        let response = await starService.buildCarrier(this.$store.state.game._id, star.data._id, ships)
        if (response.status === 200) {
          this.$toasted.show(`Carrier built at ${star.data.name}.`)

          // this.$emit('onCarrierBuilt', this.star._id)
          // this.onOpenCarrierDetailRequested(response.data)
          this.$store.state.game.galaxy.carriers.push(response.data.carrier)

          gameHelper.getStarById(this.$store.state.game, response.data.carrier.orbiting).garrison = response.data.starGarrison

          let userPlayer = gameHelper.getUserPlayer(this.$store.state.game)
          userPlayer.credits -= star.data.upgradeCosts.carriers
          this.onEditWaypointsRequested(response.data.carrier._id)
          
          AudioService.join()
        }
      } catch (err) {
        console.error(err)
      }
    },
    userOwnsObject (mapObject) {
      let userPlayer = gameHelper.getUserPlayer(this.$store.state.game)

      switch (mapObject.type) {
        case 'star':
          return gameHelper.getStarOwningPlayer(this.$store.state.game, mapObject.data)._id === userPlayer._id
        case 'carrier':
          return gameHelper.getCarrierOwningPlayer(this.$store.state.game, mapObject.data)._id === userPlayer._id
      }
    },
    isGameFinished () {
      return gameHelper.isGameFinished(this.$store.state.game)
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
    onEditWaypointsRequested (carrierID) {
      this.$emit('onEditWaypointsRequested', carrierID)
    },
    onShipTransferRequested (mapObject) {
      this.$emit('onShipTransferRequested', mapObject.data._id)
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
