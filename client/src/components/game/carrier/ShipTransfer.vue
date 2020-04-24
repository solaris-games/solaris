<template>
<div class="container">
    <h3 class="pt-2">Ship Transfer</h3>

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
            <button type="button" class="btn btn-primary float-right" @click="onTransferLeftClicked" :disabled="carrierShips <= 0"><i class="fas fa-chevron-left"></i></button>
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
            <button type="button" class="btn btn-success btn-block mr-1" :disabled="starShips < 0 || carrierShips < 0">Transfer</button>
        </div>
        <div class="col-auto pl-1">
            <button type="button" class="btn btn-primary"><i class="fas fa-plus"></i></button>
        </div>
    </div>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import CarrierApiService from '../../../services/api/carrier'
import GameContainer from '../../../game/container'

export default {
  components: {
      
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
          this.carrierShips--;
      },
      onTransferRightClicked (e) {
          this.carrierShips++
          this.starShips--;
      }
  }
}
</script>

<style scoped>
</style>
