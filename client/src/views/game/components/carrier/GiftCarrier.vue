<template>
<div>
    <div class="row bg-dark pt-2 pb-2 mb-1" v-if="carrier">
        <div class="col">
            <p class="mb-2">
                Convert this Carrier into a gift.
            </p>
        </div>
        <div v-if="!$isHistoricalMode() && canGiftCarrier" class="col-auto">
            <button type="button" class="btn btn-success btn-sm" :disabled="isGiftingCarrier" @click="giftCarrier">
                <i class="fas fa-gift"></i>
                Gift Carrier
            </button>
        </div>
    </div>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import CarrierApiService from '../../../../services/api/carrier'
import { inject } from 'vue';
import {eventBusInjectionKey} from "@/eventBus";
import GameCommandEventBusEventNames from "@/eventBusEventNames/gameCommand";

export default {
  props: {
    carrierId: String
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  data () {
    return {
      carrier: null,
      canGiftCarrier: false,
      isGiftingCarrier: false
    }
  },
  mounted () {
    this.carrier = GameHelper.getCarrierById(this.$store.state.game, this.carrierId)

    this.canGiftCarrier = !this.carrier.isGift
  },
  methods: {
    async giftCarrier (e) {
      if (!await this.$confirm('Gift carrier', `Are you sure you want to convert ${this.carrier.name} into a gift? If the carrier has a specialist, and the destination star does not belong to an ally, then it will be retired when it arrives at the destination.`)) {
        return
      }

      this.isGiftingCarrier = true

      try {
        let response = await CarrierApiService.convertToGift(this.$store.state.game._id, this.carrierId)

        if (response.status === 200) {
          // TODO: Maybe better to come from the server instead of repeating
          // server side logic and client side logic?
          this.carrier.isGift = true
          this.carrier.waypointsLooped = false;

          if (this.carrier.waypoints && this.carrier.waypoints.length) {
            let firstWaypoint = this.carrier.waypoints[0];

            firstWaypoint.action = 'nothing';
            firstWaypoint.actionShips = 0;
            firstWaypoint.delayTicks = 0;

            this.carrier.waypoints = [firstWaypoint];
          }

          this.eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, { carrier: this.carrier });

          this.$toast.default(`${this.carrier.name} has been converted into a gift.`)
        }
      } catch (err) {
        console.error(err)
      }

      this.isGiftingCarrier = false
    }
  }
}
</script>

<style scoped>
</style>
