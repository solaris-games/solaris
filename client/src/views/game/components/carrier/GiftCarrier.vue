<template>
<div>
    <div class="row bg-dark pt-2 pb-2 mb-1" v-if="carrier">
        <div class="col">
            <p class="mb-2">
                Convert this Carrier into a gift.
            </p>
        </div>
        <div v-if="!isHistoricalMode && canGiftCarrier" class="col-auto">
            <button type="button" class="btn btn-success btn-sm" :disabled="isGiftingCarrier" @click="giftCarrier">
                <i class="fas fa-gift"></i>
                Gift Carrier
            </button>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import GameHelper from '../../../../services/gameHelper'
import { inject, computed, ref } from 'vue';
import {eventBusInjectionKey} from "@/eventBus";
import GameCommandEventBusEventNames from "@/eventBusEventNames/gameCommand";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import { useStore } from 'vuex';
import type {Game, Carrier} from "@/types/game";
import {makeConfirm} from "@/util/confirm";
import {gift} from "@/services/typedapi/carrier";
import {useIsHistoricalMode} from "@/util/reactiveHooks";

const props = defineProps<{
  carrierId: string,
}>();

const store = useStore();
const confirm = makeConfirm(store);

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const isGiftingCarrier = ref(false);

const isHistoricalMode = useIsHistoricalMode(store);

const game = computed<Game>(() => store.state.game);
const carrier = computed<Carrier>(() => GameHelper.getCarrierById(game.value, props.carrierId)!);
const canGiftCarrier = computed<boolean>(() => !carrier.value.isGift);

const giftCarrier = async () => {
  if (!await confirm('Gift carrier', `Are you sure you want to convert ${carrier.value.name} into a gift? If the carrier has a specialist, and the destination star does not belong to an ally, then it will be retired when it arrives at the destination.`)) {
    return;
  }

  isGiftingCarrier.value = true;

  const response = await gift(httpClient)(game.value._id, carrier.value._id);

  if (isOk(response)) {
    carrier.value.isGift = true;
    carrier.value.waypointsLooped = false;

    if (carrier.value.waypoints && carrier.value.waypoints.length) {
      const firstWaypoint = carrier.value.waypoints[0];

      firstWaypoint.action = 'nothing';
      firstWaypoint.actionShips = 0;
      firstWaypoint.delayTicks = 0;

      carrier.value.waypoints = [firstWaypoint];
    }

    eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, { carrier: carrier.value });

    toast.default(`${carrier.value.name} has been converted into a gift.`)
  } else {
    console.error(formatError(response));
  }

  isGiftingCarrier.value = false;
};
</script>

<style scoped>
</style>
