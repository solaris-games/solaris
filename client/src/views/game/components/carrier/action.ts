import { inject, type Ref } from 'vue';
import {saveWaypoints as saveWaypointsReq} from "@/services/typedapi/carrier";
import {httpInjectionKey, isOk} from "@/services/typedapi";
import AudioService from "@/game/audio";
import GameCommandEventBusEventNames from "@/eventBusEventNames/gameCommand";
import type {Carrier, Game} from "@/types/game";
import type {CarrierWaypoint} from "@solaris-common";
import {toastInjectionKey} from "@/util/keys";
import {eventBusInjectionKey} from "@/eventBus";
import {useGameServices} from "@/util/gameServices";

export const saveWaypoints = (game: Ref<Game>, isSavingWaypoints: Ref<boolean>) => async (carrier: Carrier, waypoints: CarrierWaypoint<string>[]) => {
  isSavingWaypoints.value = true;
  const toast = inject(toastInjectionKey)!;
  const eventBus = inject(eventBusInjectionKey)!;
  const httpClient = inject(httpInjectionKey)!;
  const gameServices = useGameServices();

  const response = await saveWaypointsReq(httpClient)(game.value._id, carrier._id, waypoints, carrier.waypointsLooped);

  if (isOk(response)) {
    AudioService.join();

    carrier.waypoints = response.data.waypoints;

    gameServices.waypointService.populateCarrierWaypointEta(game.value, carrier);

    toast.default(`${carrier.name} waypoints updated.`)

    eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, {carrier: carrier});

    return true;
  } else {
    toast.error(`Failed to update ${carrier.name} waypoints.`)

    return false;
  }

  isSavingWaypoints.value = false;
};
