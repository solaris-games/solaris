import { inject, type Ref } from "vue";
import { GameCommandEventBusEventNames } from "@solaris/map-rendering";
import { saveWaypoints as saveWaypointsReq } from "@/services/typedapi/carrier";
import { httpInjectionKey, isOk } from "@/services/typedapi";
import AudioService from "../../../../services/audio";
import type { Carrier, Game } from "@/types/game";
import type { CarrierWaypoint } from "@solaris/common";
import { eventBusInjectionKey } from "@/eventBus";
import { useGameServices } from "@/util/gameServices";

import { useToast } from "vue-toast-notification";
export const saveWaypoints = (
  game: Ref<Game>,
  isSavingWaypoints: Ref<boolean>,
) => {
  const toast = useToast();
  const eventBus = inject(eventBusInjectionKey)!;
  const httpClient = inject(httpInjectionKey)!;
  const gameServices = useGameServices();

  return async (carrier: Carrier, waypoints: CarrierWaypoint<string>[]) => {
    isSavingWaypoints.value = true;

    const response = await saveWaypointsReq(httpClient)(
      game.value._id,
      carrier._id,
      waypoints,
      carrier.waypointsLooped,
    );

    if (isOk(response)) {
      AudioService.join();

      carrier.waypoints = response.data.waypoints;

      gameServices.waypointService.populateCarrierWaypointEta(
        game.value,
        carrier,
      );

      toast.default(`${carrier.name} waypoints updated.`);

      eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, {
        carrier: carrier,
      });

      isSavingWaypoints.value = false;

      return true;
    } else {
      toast.error(`Failed to update ${carrier.name} waypoints.`);

      isSavingWaypoints.value = false;

      return false;
    }
  };
};
