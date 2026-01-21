<template>
<div class="menu-page">
    <div class="container">
        <menu-title title="Select Object" @onCloseRequested="onCloseRequested"/>
    </div>

    <div class="table-responsive">
        <table class="table mb-0">
            <tbody>
                <tr v-for="mapObject in mapObjects" :key="mapObject.data._id">
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

                        <button title="Distribute ships evenly to carriers" v-if="mapObject.type === 'star' && hasCarriersInOrbit(mapObject)" type="button" class="btn btn-outline-secondary ms-2" @click="distributeShips(mapObject)"><i class="fas fa-arrow-down-wide-short"></i></button>
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

<script setup lang="ts">
import gameHelper from '../../../../services/gameHelper'
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import { inject } from 'vue';
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import { useStore, type Store } from 'vuex';
import type { State } from '@/store';
import {distributeAllShips, garrisonAllShips} from "@/services/typedapi/star";
import type {ObjectClicked} from "@/eventBusEventNames/map";
import type {Player} from "@/types/game";
import MenuTitle from "@/views/game/components/MenuTitle.vue";
import SpecialistIcon from "@/views/game/components/specialist/SpecialistIcon.vue";
import {makeShipTransferActions} from "@/views/game/components/star/shipTransfer";
import {makeConfirm} from "@/util/confirm";

const props = defineProps<{
  mapObjects: ObjectClicked[],
}>();

const emit = defineEmits<{
  onBuildCarrierRequested: [starId: string],
  onCloseRequested: [],
  onShipTransferRequested: [objectId: string],
  onEditWaypointsRequested: [carrierId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const toast = inject(toastInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const store: Store<State> = useStore();

const onBuildCarrierRequested = (starId: string) => emit('onBuildCarrierRequested', starId);

const onCloseRequested = () => emit('onCloseRequested');

const hasEnoughCredits = (mo: ObjectClicked) => {
  if (mo.type !== 'star') {
    return false;
  }

  const star = mo.data;

  if (!star.upgradeCosts?.carriers) {
    return;
  }

  const userPlayer = gameHelper.getUserPlayer(store.state.game)!;
  return userPlayer.credits >= star.upgradeCosts!.carriers!;
};

const { transferAllToStar: tats, distributeShips: ds } = makeShipTransferActions(store, httpClient, toast);

const transferAllToStar = (mo: ObjectClicked) => mo.type === 'star' && tats(mo.data);
const distributeShips = (mo: ObjectClicked) => mo.type === 'star' && ds(mo.data);

const userOwnsObject = (mapObject: ObjectClicked) => {
  const userPlayer = gameHelper.getUserPlayer(store.state.game);

  if (!userPlayer) {
    return false;
  }

  let owningPlayer: Player;

  switch (mapObject.type) {
    case 'star':
      owningPlayer = gameHelper.getStarOwningPlayer(store.state.game, mapObject.data)!;
      break;
    case 'carrier':
      owningPlayer = gameHelper.getCarrierOwningPlayer(store.state.game, mapObject.data)!;
      break;
  }

  if (!owningPlayer) {
    return false;
  }

  return owningPlayer._id === userPlayer._id;
};

const userOwnsStar = (starId: string) => {
  const userPlayer = gameHelper.getUserPlayer(store.state.game)!;
  const star = gameHelper.getStarById(store.state.game, starId)!;
  const owner = gameHelper.getStarOwningPlayer(store.state.game, star);

  return userPlayer && owner && userPlayer._id === owner._id;
};

const hasCarriersInOrbit = (mapObject: ObjectClicked) => {
  const star = gameHelper.getStarById(store.state.game, mapObject.data._id)!;

  return gameHelper.getCarriersOrbitingStar(store.state.game, star).length > 0;
};

const isGameFinished = () => {
  return gameHelper.isGameFinished(store.state.game);
};

const getObjectOwningPlayer = (mapObject: ObjectClicked) => {
  switch (mapObject.type) {
    case 'star':
      return gameHelper.getStarOwningPlayer(store.state.game, mapObject.data)!;
    case 'carrier':
      return gameHelper.getCarrierOwningPlayer(store.state.game, mapObject.data)!;
  }
};

const getFriendlyColour = (mapObject: ObjectClicked) => {
  let owningPlayer: Player;

  switch (mapObject.type) {
    case 'star':
      owningPlayer = gameHelper.getStarOwningPlayer(store.state.game, mapObject.data)!;
      break;
    case 'carrier':
      owningPlayer = gameHelper.getCarrierOwningPlayer(store.state.game, mapObject.data)!;
      break;
  }

  if (!owningPlayer) {
    return '';
  }

  return gameHelper.getFriendlyColour(store.getters.getColourForPlayer(owningPlayer._id).value);
}

const onViewObjectRequested = (mapObject: ObjectClicked) => {
  switch (mapObject.type) {
    case 'star':
      eventBus.emit(MapCommandEventBusEventNames.MapCommandClickStar, { starId: mapObject.data._id });
      break;
    case 'carrier':
      eventBus.emit(MapCommandEventBusEventNames.MapCommandClickCarrier, { carrierId: mapObject.data._id });
      break;
  }
};

const onEditWaypointsRequested = (carrierID: string) => {
  emit('onEditWaypointsRequested', carrierID);
}

const onShipTransferRequested = (mapObject: ObjectClicked) => {
  emit('onShipTransferRequested', mapObject.data._id);
};
</script>

<style scoped>
td {
  vertical-align: middle !important;
}

.col-percent-12-5 {
  width: 12.5%;
}
</style>
