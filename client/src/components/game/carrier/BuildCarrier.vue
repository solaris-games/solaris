<template>
<div class="menu-page container" v-if="star">
    <menu-title title="Build Carrier" @onCloseRequested="onCloseRequested"/>

    <div class="row bg-secondary mb-2">
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
                    <button type="button" class="btn btn-danger btn-block" @click="onMinShipsClicked">Min</button>
                </div>
                <div class="col">
                    <button type="button" title="1" class="btn btn-primary float-right ml-1" @click="onTransferLeftClicked(1)" :disabled="carrierShips <= 1"><i class="fas fa-angle-left"></i></button>
                    <button type="button" title="10"  class="btn btn-primary ml-1 float-right" @click="onTransferLeftClicked(10)" :disabled="carrierShips <= 10"><i class="fas fa-angle-double-left"></i></button>
                    <button type="button" title="100"  class="btn btn-primary float-right" @click="onTransferLeftClicked(100)" :disabled="carrierShips <= 100"><i class="fas fa-angle-left"></i><i class="fas fa-angle-double-left"></i></button>
                </div>
            </div>
        </div>

        <div class="col-6">
            <div class="row no-gutters">
                <div class="col">
                    <button type="button"  title="1" class="btn btn-primary" @click="onTransferRightClicked(1)" :disabled="starShips <= 0"><i class="fas fa-angle-right"></i></button>
                    <button type="button" title="10"  class="btn btn-primary ml-1" @click="onTransferRightClicked(10)" :disabled="starShips < 10"><i class="fas fa-angle-double-right"></i></button>
                    <button type="button" title="100"  class="btn btn-primary ml-1 " @click="onTransferRightClicked(100)" :disabled="starShips < 100"><i class="fas fa-angle-double-right"></i><i class="fas fa-angle-right"></i></button>
                </div>
                <div class="col-4">
                    <button type="button" class="btn btn-success btn-block " @click="onMaxShipsClicked">Max</button>
                </div>
            </div>
        </div>
    </div>

    <div class="row pb-2 pt-2 bg-secondary">
        <div class="col">
            <button type="button" class="btn btn-danger" :disabled="isBuildingCarrier" @click="onOpenStarDetailRequested">
                <i class="fas fa-arrow-left"></i>
                Back to Star
            </button>
        </div>
        <div class="col-auto">
            <button type="button" class="btn btn-success btn-block" :disabled="$isHistoricalMode() || isBuildingCarrier || starShips < 0 || carrierShips < 0" @click="saveTransfer">
                <i class="fas fa-rocket"></i>
                Build for ${{star.upgradeCosts.carriers}}
            </button>
        </div>
    </div>
</div>
</template>

<script>
import starService from '../../../services/api/star'
import AudioService from '../../../game/audio'
import GameHelper from '../../../services/gameHelper'
import MenuTitle from '../MenuTitle'
import GameContainer from '../../../game/container'

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
    onStarShipsChanged (e) {
      let difference = parseInt(this.starShips) - this.star.ships
      this.carrierShips = Math.abs(difference)
    },
    onCarrierShipsChanged (e) {
      let difference = parseInt(this.carrierShips)
      this.starShips = this.star.ships - difference
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
                this.$toasted.show(`Carrier built at ${this.star.name}.`)

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
