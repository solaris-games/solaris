<template>
<div>
    <div class="row bg-secondary pt-2 pb-0 mb-1" v-if="carrier">
        <div class="col">
            <p class="mb-2">
                Convert this Carrier into a gift. <a href="javascript:;">Read More</a>.
            </p>
        </div>
        <div v-if="canGiftCarrier" class="col-auto">
          <modalButton modalName="confirmGiftCarrierModal" classText="btn btn-sm btn-success"><i class="fas fa-gift"></i> Gift Carrier</modalButton>
        </div>
    </div>

    <dialogModal v-if="carrier" modalName="confirmGiftCarrierModal" titleText="Convert to Gift" cancelText="No" confirmText="Yes" @onConfirm="onConfirmGiftCarrier">
      <p>Are you sure you want to convert <b>{{carrier.name}}</b> into a gift?</p>
    </dialogModal>
</div>
</template>

<script>
import ModalButton from '../../modal/ModalButton'
import DialogModal from '../../modal/DialogModal'
import GameHelper from '../../../services/gameHelper'
import CarrierApiService from '../../../services/api/carrier'
import GameContainer from '../../../game/container'

export default {
  components: {
    'modalButton': ModalButton,
    'dialogModal': DialogModal
  },
  props: {
    carrierId: String
  },
  data () {
    return {
      carrier: null,
      canHireSpecialist: false,
      isGiftingCarrier: false
    }
  },
  mounted () {
    this.carrier = GameHelper.getCarrierById(this.$store.state.game, this.carrierId)

    this.canGiftCarrier = !this.carrier.isGift && !this.carrier.orbiting
  },
  methods: {
    async onConfirmGiftCarrier (e) {
      this.isGiftingCarrier = true

      try {
        let response = await CarrierApiService.convertToGift(this.$store.state.game._id, this.carrierId)

        if (response.status === 200) {
          // TODO: Maybe better to come from the server instead of repeating
          // server side logic and client side logic?
          this.carrier.isGift = true
          this.carrier.waypointsLooped = false;

          let firstWaypoint = this.carrier.waypoints[0];

          firstWaypoint.action = 'nothing';
          firstWaypoint.actionShips = 0;
          firstWaypoint.delayTicks = 0;

          this.carrier.waypoints = [firstWaypoint];

          GameContainer.reloadCarrier(this.carrier)

          this.$toasted.show(`${this.carrier.name} has been converted into a gift.`)
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
