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
                    <td v-if="mapObject.type === 'star'" class="col-auto text-center ps-2 pe-2" @click="onViewObjectRequested(mapObject)">
                        <specialist-icon :type="'star'" :defaultIcon="'star'" :specialist="mapObject.data.specialist" />
                    </td>
                    <td v-if="mapObject.type === 'carrier'" class="col-auto text-center ps-2 pe-2" @click="onViewObjectRequested(mapObject)">
                        <specialist-icon :type="'carrier'" :defaultIcon="'rocket'" :specialist="mapObject.data.specialist" />
                    </td>
                    <td class="bg-dark text-center ps-2 pe-2">
                        <span>{{mapObject.data.ships == null ? '???' : mapObject.data.ships}}</span>
                    </td>
                    <td class="ps-2 pe-2">
                        <span><a href="javascript:;" @click="onViewObjectRequested(mapObject)">{{mapObject.data.name}}</a></span>
                    </td>
                    <td class="text-end ps-2 pe-2">
                        <span v-if="mapObject.type === 'carrier' && (userOwnsObject(mapObject) || mapObject.data.waypoints.length)">
                          <i class="fas fa-map-marker-alt"></i>
                          <i class="fas fa-sync ms-1" v-if="mapObject.data.waypointsLooped"></i>
                          {{mapObject.data.waypoints.length}}
                        </span>
                    </td>
                    <td class="text-end ps-2 pe-2">
                      <span v-if="userOwnsObject(mapObject) && !getObjectOwningPlayer(mapObject).defeated && !isGameFinished()">
                        <button title="Transfer ships between carrier and star" v-if="mapObject.type === 'carrier' && mapObject.data.orbiting && userOwnsStar(mapObject.data.orbiting)" type="button" class="btn btn-outline-primary" @click="onShipTransferRequested(mapObject)"><i class="fas fa-exchange-alt"></i></button>
                        <button title="Edit carrier waypoints" v-if="mapObject.type === 'carrier'" type="button" class="btn btn-primary ms-2" @click="onEditWaypointsRequested(mapObject.data._id)"><i class="fas fa-map-marker-alt"></i> </button>

                        <button title="Distribute ships evenly to carriers" v-if="mapObject.type === 'star' && hasCarriersInOrbit(mapObject)" type="button" class="btn btn-outline-secondary ms-2" @click="distributeAllShips(mapObject)"><i class="fas fa-arrow-down-wide-short"></i></button>
                        <button title="Transfer all ships to the star" v-if="mapObject.type === 'star' && hasCarriersInOrbit(mapObject)" type="button" class="btn btn-outline-primary ms-2" @click="transferAllToStar(mapObject)"><i class="fas fa-arrow-up-wide-short"></i></button>
                        <button title="Build a new carrier" v-if="mapObject.type === 'star' && mapObject.data.ships && hasEnoughCredits(mapObject) && mapObject.data.naturalResources && mapObject.data.naturalResources.economy && mapObject.data.naturalResources.industry && mapObject.data.naturalResources.science" type="button" class="btn btn-info ms-2" @click="onBuildCarrierRequested(mapObject.data._id)"><i class="fas fa-rocket"></i></button>
                      </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
</template>

<script>
import gameHelper from '../../../../services/gameHelper'
import MenuTitleVue from '../MenuTitle.vue'
import SpecialistIconVue from '../specialist/SpecialistIcon.vue'
import starService from '../../../../services/api/star'
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import { inject } from 'vue';

export default {
  components: {
    'menu-title': MenuTitleVue,
    'specialist-icon': SpecialistIconVue
  },
  props: {
    mapObjects: Array
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  data () {
    return {
      audio: null
    }
  },
  methods: {
    onBuildCarrierRequested (starId) {
      this.$emit('onBuildCarrierRequested', starId)
    },
    hasEnoughCredits(mapObject) {
      let star = mapObject
      let userPlayer = gameHelper.getUserPlayer(this.$store.state.game)
      let availableCredits = userPlayer.credits

      return (availableCredits >= star.data.upgradeCosts.carriers)
    },
    async transferAllToStar(star) {
      try {
        let response = await starService.transferAllToStar(this.$store.state.game._id, star.data._id)

        if (response.status === 200) {
          this.$toast.default(`All ships transfered to ${star.data.name}.`)

          this.$store.commit('gameStarAllShipsTransferred', response.data)
        }
      } catch (err) {
        console.log(err)
      }
    },
    async distributeAllShips(star) {
      try {
        let response = await starService.distributeAllShips(this.$store.state.game._id, star.data._id)

        if (response.status === 200) {
          this.$toast.default(`All ships at ${star.data.name} distributed to carriers in orbit.`)

          this.$store.commit('gameStarAllShipsTransferred', response.data)
        }
      } catch (err) {
        console.log(err)
      }
    },
    userOwnsObject (mapObject) {
      let userPlayer = gameHelper.getUserPlayer(this.$store.state.game)

      if (!userPlayer) {
        return false
      }

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
        return false
      }

      return owningPlayer._id === userPlayer._id
    },
    userOwnsStar (starId) {
      let userPlayer = gameHelper.getUserPlayer(this.$store.state.game)
      let star = gameHelper.getStarById(this.$store.state.game, starId)
      let owner = gameHelper.getStarOwningPlayer(this.$store.state.game, star)

      return userPlayer && owner && userPlayer._id === owner._id
    },
    hasCarriersInOrbit (mapObject) {
      let star = gameHelper.getStarById(this.$store.state.game, mapObject.data._id)

      return gameHelper.getCarriersOrbitingStar(this.$store.state.game, star).length > 0
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

      return gameHelper.getFriendlyColour(this.$store.getters.getColourForPlayer(owningPlayer._id).value)
    },
    onViewObjectRequested (mapObject) {
      switch (mapObject.type) {
        case 'star':
          this.eventBus.emit(MapCommandEventBusEventNames.MapCommandClickStar, { starId: mapObject.data._id });
          break
        case 'carrier':
          this.eventBus.emit(MapCommandEventBusEventNames.MapCommandClickCarrier, { carrierId: mapObject.data._id });
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

.col-percent-12-5 {
  width: 12.5%;
}
</style>
