<template>
<div class="container">
    <menu-title title="Ship Transfer" @onCloseRequested="onCloseRequested"/>

    <div class="row bg-secondary mb-2">
      <div class="col text-center pt-3">
        <p>While in orbit of a star you may move ships to and from a fleet Carrier. It's free to transfer ships.</p>
      </div>
    </div>

    <div class="row">
        <div class="col" v-if="star">
            <p class="mb-0">{{star.name}}</p>
        </div>
        <div class="col" v-if="carrier">
            <p class="mb-0">{{carrier.name}}</p>
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
            <button type="button" class="btn btn-danger btn-block" @click="onMinShipsClicked">Min</button>
        </div>
        <div class="col-3">
            <button type="button" class="btn btn-primary float-right" @click="onTransferLeftClicked" :disabled="carrierShips <= 1"><i class="fas fa-chevron-left"></i></button>
        </div>
        <div class="col-3">
            <button type="button" class="btn btn-primary" @click="onTransferRightClicked" :disabled="starShips <= 0"><i class="fas fa-chevron-right"></i></button>
        </div>
        <div class="col-3">
            <button type="button" class="btn btn-success btn-block float-right" @click="onMaxShipsClicked">Max</button>
        </div>
    </div>

    <div class="row pb-2 pt-2 bg-secondary">
        <div class="col-6"></div>
        <div class="col pr-0">
            <button type="button" class="btn btn-success btn-block mr-1" :disabled="isTransferringShips || starShips < 0 || carrierShips < 0" @click="saveTransfer">Transfer</button>
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
    carrierId: String
  },
  data () {
    return {
      carrier: null,
      star: null,
      starShips: 0,
      carrierShips: 0,
      isTransferringShips: false
    }
  },
  mounted () {
    this.sockets.subscribe('gameTicked', (data) => this.onGameTicked(data))

    this.carrier = GameHelper.getCarrierById(this.$store.state.game, this.carrierId)
    this.star = GameHelper.getStarById(this.$store.state.game, this.carrier.orbiting)

    this.starShips = this.star.garrison
    this.carrierShips = this.carrier.ships
  },
  destroyed () {
    this.sockets.unsubscribe('gameTicked')
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onGameTicked (data) {
      // When the game ticks there may have been ships built at the star.
      // Find the star in the tick report and compare the garrison, then add
      // the difference to the star ships side on the transfer.

      // NOTE: At this stage the star will have the latest data for its garrison
      // as the store deals with updating the star.
      this.carrier = GameHelper.getCarrierById(this.$store.state.game, this.carrierId)
      this.star = GameHelper.getStarById(this.$store.state.game, this.carrier.orbiting)

      // If the game ticks then check to see if any ships have been built at the star.
      let totalInTransfer = this.starShips + this.carrierShips
      let totalOriginal = this.star.garrison + this.carrier.ships
      let difference = totalOriginal - totalInTransfer

      // If there is a difference then this means that ship(s) have been built at the star
      // while the user has been on this screen, in that case, add the new ships to the star total
      if (difference) {
        this.starShips += difference
        this.onStarShipsChanged()
      }
    },
    onStarShipsChanged (e) {
      let difference = parseInt(this.starShips) - this.star.garrison
      this.carrierShips = this.carrier.ships - difference
    },
    onCarrierShipsChanged (e) {
      let difference = parseInt(this.carrierShips) - this.carrier.ships
      this.starShips = this.star.garrison - difference
    },
    onMinShipsClicked (e) {
      this.carrierShips = 1
      this.starShips = this.carrier.ships + this.star.garrison - 1
    },
    onMaxShipsClicked (e) {
      this.starShips = 0
      this.carrierShips = this.carrier.ships + this.star.garrison
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
        this.isTransferringShips = true

        let response = await CarrierApiService.transferShips(
          this.$store.state.game._id,
          this.carrier._id,
          parseInt(this.carrierShips),
          this.star._id,
          parseInt(this.starShips))

        if (response.status === 200) {
          this.$toasted.show(`Ships transferred between ${this.star.name} and ${this.carrier.name}.`)

          // Note: The web socket event handles setting the carrier and star ships.
          this.$emit('onShipsTransferred', this.carrier._id)
        }
      } catch (err) {
        console.log(err)
      }

      this.isTransferringShips = false
    },
    onOpenCarrierDetailRequested (e) {
      this.$emit('onOpenCarrierDetailRequested', this.carrier._id)
    }
  }
}
</script>

<style scoped>
</style>
