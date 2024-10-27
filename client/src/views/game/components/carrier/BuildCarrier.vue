<template>
<div class="menu-page container" v-if="star">
    <menu-title title="Build Carrier" @onCloseRequested="onCloseRequested"/>

    <div class="row bg-dark mb-2">
      <div class="col text-center pt-3">
        <p>Build a new Carrier at <a href="javascript:;" @click="onOpenStarDetailRequested">{{star.name}}</a>, decide how many ships the new Carrier will have.</p>
      </div>
    </div>

    <div class="row">
        <div class="col" v-if="star">
            <p class="mb-0">{{star.name}}</p>
        </div>
        <div class="col">
            <p class="mb-0">New Carrier</p>
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

    <div class="row pb-2 pt-2 ">
        <div class="col">
            <button type="button" class="btn btn-outline-danger" :disabled="isBuildingCarrier" @click="onOpenStarDetailRequested">
                <i class="fas fa-arrow-left"></i>
                Back to Star
            </button>
        </div>
        <div class="col-auto">
          <div class="d-grid gap-2">
            <button type="button" class="btn btn-info" :disabled="$isHistoricalMode() || isBuildingCarrier || starShips < 0 || carrierShips < 1" @click="saveTransfer">
                <i class="fas fa-rocket"></i>
                Build for ${{star.upgradeCosts.carriers}}
            </button>
          </div>
        </div>
    </div>
</div>
</template>

<script>
import starService from '../../../../services/api/star'
import AudioService from '../../../../game/audio'
import GameHelper from '../../../../services/gameHelper'
import MenuTitle from '../MenuTitle.vue'

export default {
  components: {
    'menu-title': MenuTitle
  },
  props: {
    starId: String
  },
  data () {
    return {
      star: null,
      starShips: 0,
      carrierShips: 0,
      isBuildingCarrier: false
    }
  },
  mounted () {
    this.star = GameHelper.getStarById(this.$store.state.game, this.starId)

    this.starShips = 0
    this.carrierShips = this.star.ships
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onStarShipsChanged(e) {
      let difference = this.ensureInt(this.starShips) - this.star.ships
      this.carrierShips = Math.abs(difference)
    },
    onStarShipsBlur(e) {
      this.starShips = this.ensureInt(this.starShips);
    },
    onCarrierShipsChanged(e) {
      let difference = this.ensureInt(this.carrierShips);
      this.starShips = this.star.ships - difference
    },
    onCarrierShipsBlur(e) {
      this.carrierShips = this.ensureInt(this.carrierShips);
    },
    onMinShipsClicked (e) {
      this.carrierShips = 1
      this.starShips = this.star.ships - 1
    },
    onMaxShipsClicked (e) {
      this.starShips = 0
      this.carrierShips = this.star.ships
    },
    onTransferLeftClicked (e) {
      this.starShips+=e
      this.carrierShips-=e
    },
    onTransferRightClicked (e) {
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
    onOpenStarDetailRequested (e) {
        this.$emit('onOpenStarDetailRequested', this.star._id)
    },
    async saveTransfer (e) {
      if (this.$store.state.settings.carrier.confirmBuildCarrier === 'enabled'
        && !await this.$confirm('Build a carrier', `Are you sure you want to build a Carrier at ${this.star.name}? The carrier will cost $${this.star.upgradeCosts.carriers}.`)) {
        return
      }

        this.isBuildingCarrier = true

        try {
            let ships = this.carrierShips

            let response = await starService.buildCarrier(this.$store.state.game._id, this.star._id, ships)

            if (response.status === 200) {
                this.$toast.default(`Carrier built at ${this.star.name}.`)

                this.$store.commit('gameStarCarrierBuilt', response.data)

                AudioService.join()

                this.$emit('onEditWaypointsRequested', response.data.carrier._id)
            }
        } catch (err) {
            console.error(err)
        }

        this.isBuildingCarrier = false
    }
  }
}
</script>

<style scoped>
</style>
