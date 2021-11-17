<template>
<div class="menu-page container">
    <menu-title title="Ship Transfer" @onCloseRequested="onCloseRequested"/>

    <div class="row bg-secondary mb-2">
      <div class="col text-center pt-3">
        <p>While in orbit of a star you may move ships to and from a fleet Carrier.</p>
      </div>
    </div>

    <div class="row">
        <div class="col" v-if="star">
            <p class="mb-0"><i class="fas fa-star mr-1"></i>{{star.name}}</p>
        </div>
        <div class="col" v-if="carrier">
            <p class="mb-0"><i class="fas fa-rocket mr-1"></i>{{carrier.name}}</p>
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
        <div class="col-6">
            <div class="row no-gutters">
                <div class="col-4">
                    <button type="button" title="Transfer all ships to the star" class="btn btn-danger btn-block" @click="onMinShipsClicked">Min</button>
                </div>
                <div class="col">
                    <button type="button" title="Transfer 1 ship to the star" class="btn btn-primary float-right ml-1" @click="onTransferLeftClicked(1)" :disabled="carrierShips <= 1"><i class="fas fa-angle-left"></i></button>
                    <button type="button" title="Transfer 10 ships to the star"  class="btn btn-primary ml-1 float-right" @click="onTransferLeftClicked(10)" :disabled="carrierShips <= 10"><i class="fas fa-angle-double-left"></i></button>
                    <button type="button" title="Transfer 100 ships to the star"  class="btn btn-primary float-right" @click="onTransferLeftClicked(100)" :disabled="carrierShips <= 100"><i class="fas fa-angle-left"></i><i class="fas fa-angle-double-left"></i></button>
                </div>
            </div>
        </div>

        <div class="col-6">
            <div class="row no-gutters">
                <div class="col">
                    <button type="button" title="Transfer 1 ship to the carrier" class="btn btn-primary" @click="onTransferRightClicked(1)" :disabled="starShips <= 0"><i class="fas fa-angle-right"></i></button>
                    <button type="button" title="Transfer 10 ships to the carrier"  class="btn btn-primary ml-1" @click="onTransferRightClicked(10)" :disabled="starShips < 10"><i class="fas fa-angle-double-right"></i></button>
                    <button type="button" title="Transfer 100 ships to the carrier"  class="btn btn-primary ml-1 " @click="onTransferRightClicked(100)" :disabled="starShips < 100"><i class="fas fa-angle-double-right"></i><i class="fas fa-angle-right"></i></button>
                </div>
                <div class="col-4">
                    <button type="button" title="Transfer all ships to the carrier" class="btn btn-success btn-block" @click="onMaxShipsClicked">Max</button>
                </div>
            </div>
        </div>
    </div>

    <div class="row pb-2 pt-2 bg-secondary">
        <div class="col-6"></div>
        <div class="col pr-0">
            <button type="button" class="btn btn-success btn-block mr-1" :disabled="$isHistoricalMode() || isTransferringShips || starShips < 0 || carrierShips < 0" @click="saveTransfer">Transfer</button>
        </div>
        <div class="col-auto pl-1">
            <button type="button" class="btn btn-primary" @click="onEditWaypointsRequested"><i class="fas fa-plus"></i></button>
        </div>
    </div>
</div>
</template>

<script>
import { mapState } from 'vuex'
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
    this.carrier = GameHelper.getCarrierById(this.$store.state.game, this.carrierId)
    this.star = GameHelper.getStarById(this.$store.state.game, this.carrier.orbiting)

    this.starShips = this.star.ships
    this.carrierShips = this.carrier.ships
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onGameReloaded (data) {
      // When the game ticks there may have been ships built at the star.
      // Find the star in the tick report and compare the ships, then add
      // the difference to the star ships side on the transfer.

      // NOTE: At this stage the star will have the latest data for its ships
      // as the store deals with updating the star.
      this.carrier = GameHelper.getCarrierById(this.$store.state.game, this.carrierId)
      this.star = GameHelper.getStarById(this.$store.state.game, this.carrier.orbiting)

      // If the game ticks then check to see if any ships have been built at the star.
      let totalInTransfer = this.starShips + this.carrierShips
      let totalOriginal = this.star.ships + this.carrier.ships
      let difference = totalOriginal - totalInTransfer

      // If there is a difference then this means that ship(s) have been built at the star
      // while the user has been on this screen, in that case, add the new ships to the star total
      if (difference) {
        this.starShips += difference
        this.onStarShipsChanged()
      }
    },
    onStarShipsChanged (e) {
      let difference = parseInt(this.starShips) - this.star.ships
      this.carrierShips = this.carrier.ships - difference
    },
    onCarrierShipsChanged (e) {
      let difference = parseInt(this.carrierShips) - this.carrier.ships
      this.starShips = this.star.ships - difference
    },
    onMinShipsClicked (e) {
      this.carrierShips = 1
      this.starShips = this.carrier.ships + this.star.ships - 1
    },
    onMaxShipsClicked (e) {
      this.starShips = 0
      this.carrierShips = this.carrier.ships + this.star.ships
    },
    onTransferLeftClicked (e) {
      this.starShips+=e
      this.carrierShips-=e
    },
    onTransferRightClicked (e) {
      this.carrierShips+=e
      this.starShips-=e
    },
    async saveTransfer (e) {
      let result = await this.performSaveTransfer()

      if (result) {
        this.$emit('onShipsTransferred', this.carrier._id)
      }
    },
    async onEditWaypointsRequested (e) {
      let result = await this.performSaveTransfer()

      if (result) {
        this.$emit('onEditWaypointsRequested', this.carrier._id)
      }
    },
    async performSaveTransfer() {
      let transferred = false

      try {
        this.isTransferringShips = true

        let cShips = parseInt(this.carrierShips)
        let sShips = parseInt(this.starShips)

        let response = await CarrierApiService.transferShips(
          this.$store.state.game._id,
          this.carrier._id,
          cShips,
          this.star._id,
          sShips)

        if (response.status === 200) {
          this.$toasted.show(`Ships transferred between ${this.star.name} and ${this.carrier.name}.`)

          this.$store.commit('gameStarCarrierShipTransferred', {
            starId: this.star._id,
            carrierId: this.carrier._id,
            starShips: sShips,
            carrierShips: cShips
          })

          this.star.ships = sShips
          this.carrier.ships = cShips

          transferred = true
        }
      } catch (err) {
        console.log(err)
      }

      this.isTransferringShips = false

      return transferred
    }
  },
  computed: mapState(['game']),
  watch: {
    game (newGame, oldGame) {
      this.onGameReloaded(newGame)
    }
  }
}
</script>

<style scoped>
</style>
