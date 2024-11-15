<template>
<div class="menu-page container">
    <menu-title title="Ship Transfer" @onCloseRequested="onCloseRequested"/>

    <div class="row mb-0">
      <div class="col text-center pt-2 pb-2">
        <p class="mb-0"><small>While in <strong>orbit</strong> of a star you may transfer ships.</small></p>
      </div>
    </div>

    <div class="row mb-0 pt-2 pb-2 bg-dark" v-if="carrier && carrier.waypoints && carrier.waypoints.length">
      <div class="col">
        <p class="mb-0"><i class="fas fa-map-marker-alt me-2"></i><strong>{{carrier.name}}</strong>'s next waypoint is to <star-label :starId="carrierWaypointDestination"/>.</p>
      </div>
    </div>

    <div class="row mt-2">
        <div class="col" v-if="star">
            <p class="mb-0"><i class="fas fa-star me-1"></i>{{star.name}}</p>
        </div>
        <div class="col" v-if="carrier">
            <p class="mb-0"><i class="fas fa-rocket me-1"></i>{{carrier.name}}</p>
        </div>
    </div>

    <div class="row mb-1">
        <div class="col">
            <input v-model="starShips" type="number" class="form-control" @input="onStarShipsChanged" @blur="onStarShipsBlur">
        </div>
        <div class="col">
            <input v-model="carrierShips" type="number" class="form-control" @input="onCarrierShipsChanged" @blur="onCarrierShipsBlur">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-6">
            <div class="row g-0">
                <div class="col-4">
                  <div class="d-grid gap-2">
                    <button type="button" title="Transfer all ships to the star" class="btn btn-danger" @click="onMinShipsClicked">Min</button>
                  </div>
                </div>
                <div class="col">
                    <button type="button" title="Transfer 1 ship to the star" class="btn btn-outline-primary float-end ms-1" @click="onTransferLeftClicked(1)" :disabled="carrierShips <= 1"><i class="fas fa-angle-left"></i></button>
                    <button type="button" title="Transfer 10 ships to the star"  class="btn btn-outline-primary ms-1 float-end" @click="onTransferLeftClicked(10)" :disabled="carrierShips <= 10"><i class="fas fa-angle-double-left"></i></button>
                    <button type="button" title="Transfer 100 ships to the star"  class="btn btn-outline-primary float-end" @click="onTransferLeftClicked(100)" :disabled="carrierShips <= 100"><i class="fas fa-angle-left"></i><i class="fas fa-angle-double-left"></i></button>
                </div>
            </div>
        </div>

        <div class="col-6">
            <div class="row g-0">
                <div class="col">
                    <button type="button" title="Transfer 1 ship to the carrier" class="btn btn-outline-primary" @click="onTransferRightClicked(1)" :disabled="starShips <= 0"><i class="fas fa-angle-right"></i></button>
                    <button type="button" title="Transfer 10 ships to the carrier"  class="btn btn-outline-primary ms-1" @click="onTransferRightClicked(10)" :disabled="starShips < 10"><i class="fas fa-angle-double-right"></i></button>
                    <button type="button" title="Transfer 100 ships to the carrier"  class="btn btn-outline-primary ms-1 " @click="onTransferRightClicked(100)" :disabled="starShips < 100"><i class="fas fa-angle-double-right"></i><i class="fas fa-angle-right"></i></button>
                </div>
                <div class="col-4">
                  <div class="d-grid gap-2">
                    <button type="button" title="Transfer all ships to the carrier" class="btn btn-success" @click="onMaxShipsClicked">Max</button>
                  </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row pb-2 pt-2 bg-dark">
        <div class="col-6"></div>
        <div class="col pe-0">
          <div class="d-grid gap-2">
            <button type="button" class="btn btn-success me-1" :disabled="$isHistoricalMode() || isTransferringShips || starShips < 0 || carrierShips < 1" @click="saveTransfer">
              <i class="fas fa-check"></i>
              Transfer
            </button>
          </div>
        </div>
        <div class="col-auto ps-0" v-if="canEditWaypoints">
            <button type="button" class="btn btn-outline-primary" @click="onEditWaypointsRequested"><i class="fas fa-map-marker-alt"></i></button>
        </div>
    </div>
</div>
</template>

<script>
import { mapState } from 'vuex'
import GameHelper from '../../../../services/gameHelper'
import CarrierApiService from '../../../../services/api/carrier'
import MenuTitle from '../MenuTitle.vue'
import StarLabelVue from '../star/StarLabel.vue'

export default {
  components: {
    'menu-title': MenuTitle,
    'star-label': StarLabelVue
  },
  props: {
    carrierId: String
  },
  data () {
    return {
      userPlayer: null,
      carrierOwningPlayer: null,
      carrier: null,
      star: null,
      starShips: 0,
      carrierShips: 0,
      isTransferringShips: false,
      carrierWaypointDestination: null,
      canEditWaypoints: false
    }
  },
  mounted () {
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
    this.carrier = GameHelper.getCarrierById(this.$store.state.game, this.carrierId)
    this.star = GameHelper.getStarById(this.$store.state.game, this.carrier.orbiting)
    this.carrierOwningPlayer = GameHelper.getCarrierOwningPlayer(this.$store.state.game, this.carrier)

    this.starShips = this.star.ships
    this.carrierShips = this.carrier.ships

    if (this.carrier.waypoints && this.carrier.waypoints.length) {
      this.carrierWaypointDestination = this.carrier.waypoints[0].destination
    }

    this.canEditWaypoints = this.userPlayer && this.carrierOwningPlayer == this.userPlayer && this.carrier && !this.userPlayer.defeated && !this.carrier.isGift && !GameHelper.isGameFinished(this.$store.state.game)
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
    onStarShipsChanged(e) {
      let difference = this.ensureInt(this.starShips) - this.star.ships;
      this.carrierShips = this.carrier.ships - difference;
    },
    onStarShipsBlur(e) {
      this.starShips = this.ensureInt(this.starShips);
    },
    onCarrierShipsChanged(e) {
      let difference = this.ensureInt(this.carrierShips) - this.carrier.ships;
      this.starShips = this.star.ships - difference;
    },
    onCarrierShipsBlur(e) {
      this.carrierShips = this.ensureInt(this.carrierShips);
    },
    onMinShipsClicked (e) {
      this.carrierShips = 1
      this.starShips = this.carrier.ships + this.star.ships - 1
    },
    onMaxShipsClicked (e) {
      this.starShips = 0
      this.carrierShips = this.carrier.ships + this.star.ships
    },
    onTransferLeftClicked(e) {
      this.starShips+=e
      this.carrierShips-=e
    },
    onTransferRightClicked(e) {
      this.carrierShips+=e
      this.starShips-=e
    },
    ensureInt(v) {
      v = parseInt(v);

      if (isNaN(v)) {
        v = 0;
      }

      return v;
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

        let cShips = this.carrierShips;
        let sShips = this.starShips;

        let response = await CarrierApiService.transferShips(
          this.$store.state.game._id,
          this.carrier._id,
          cShips,
          this.star._id,
          sShips)

        if (response.status === 200) {
          this.$toast.default(`Ships transferred between ${this.star.name} and ${this.carrier.name}.`)

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
