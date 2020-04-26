<template>
<div class="container">
    <menu-title title="Ship Transfer" @onCloseRequested="onCloseRequested"/>

    <div class="row bg-secondary mb-2">
      <div class="col text-center pt-3">
        <p>While in orbit of a star you may move ships to and from a fleet Carrier. It's free to transfer ships.</p>
      </div>
    </div>

    <div class="row">
        <div class="col">
            <p class="mb-0">{{transfer.star.name}}</p>
        </div>
        <div class="col">
            <p class="mb-0">{{transfer.carrier.name}}</p>
        </div>
    </div>

    <div class="row mb-1">
        <div class="col">
            <input v-model.lazy="starShips" type="number" class="form-control" @change="onStarShipsChanged">
        </div>
        <div class="col">
            <input v-model.lazy="carrierShips" type="number" class="form-control" @change="onCarrierShipsChanged">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-3">
            <button type="button" class="btn btn-primary" @click="onMinShipsClicked">Min</button>
        </div>
        <div class="col-3">
            <button type="button" class="btn btn-primary float-right" @click="onTransferLeftClicked" :disabled="carrierShips <= 1"><i class="fas fa-chevron-left"></i></button>
        </div>
        <div class="col-3">
            <button type="button" class="btn btn-primary" @click="onTransferRightClicked" :disabled="starShips <= 0"><i class="fas fa-chevron-right"></i></button>
        </div>
        <div class="col-3">
            <button type="button" class="btn btn-primary float-right" @click="onMaxShipsClicked">Max</button>
        </div>
    </div>

    <div class="row pb-2 pt-2 bg-secondary">
        <div class="col-6"></div>
        <div class="col pr-0">
            <button type="button" class="btn btn-success btn-block mr-1" :disabled="starShips < 0 || carrierShips < 0" @click="saveTransfer">Transfer</button>
        </div>
        <div class="col-auto pl-1">
            <button type="button" class="btn btn-primary" @click="onOpenCarrierDetailRequested"><i class="fas fa-plus"></i></button>
        </div>
    </div>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import CarrierApiService from '../../../services/api/carrier'
import MenuTitle from '../MenuTitle'
import GameContainer from '../../../game/container'

export default {
  components: {
    'menu-title': MenuTitle
  },
  props: {
    game: Object,
    transfer: Object
  },
  data () {
      return {
          starShips: 0,
          carrierShips: 0
      }
  },
  mounted () {
      this.starShips = this.transfer.star.garrison
      this.carrierShips = this.transfer.carrier.ships
  },
  methods: {
      onCloseRequested (e) {
        this.$emit('onCloseRequested', e)
      },
      onStarShipsChanged (e) {
        let difference = parseInt(this.starShips) - this.transfer.star.garrison
        this.carrierShips = this.transfer.carrier.ships - difference
      },
      onCarrierShipsChanged (e) {
        let difference = parseInt(this.carrierShips) - this.transfer.carrier.ships
        this.starShips = this.transfer.star.garrison - difference
      },
      onMinShipsClicked (e) {
          this.carrierShips = 1;
          this.starShips = this.transfer.carrier.ships + this.transfer.star.garrison - 1
      },
      onMaxShipsClicked (e) {
          this.starShips = 0;
          this.carrierShips = this.transfer.carrier.ships + this.transfer.star.garrison
      },
      onTransferLeftClicked (e) {
          this.starShips++
          this.carrierShips--
      },
      onTransferRightClicked (e) {
          this.carrierShips++
          this.starShips--
      },
      async saveTransfer (e) {
          try {
            let response = await CarrierApiService.transferShips(
                this.game._id, 
                this.transfer.carrier._id,
                parseInt(this.carrierShips),
                this.transfer.star._id,
                parseInt(this.starShips))

            if (response.status === 200) {
                this.$emit('onShipsTransferred', this.transfer.carrier)
            }
          } catch (err) {
              console.log(err)
          }
      },
      onOpenCarrierDetailRequested (e) {
          this.$emit('onOpenCarrierDetailRequested', this.transfer.carrier)
      }
  }
}
</script>

<style scoped>
</style>
