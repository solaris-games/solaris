<template>
<div class="container">
    <!-- TODO: These need to act off the star object itself instead of pixi object -->
    <h3 class="pt-2">{{star.data.name}}</h3>

    <div class="row bg-secondary">
      <div class="col text-center pt-3">
        <p v-if="star.data.ownedByPlayerId == currentPlayerId">A star under your command.</p>
        <p v-if="star.data.ownedByPlayerId != null && star.data.ownedByPlayerId != currentPlayerId">This star is controlled by [{{getStarOwningPlayer().alias}}].</p>
        <p v-if="star.data.ownedByPlayerId == null">This star has not been claimed by any faction. Send a carrier here to claim it for yourself.</p>
      </div>
    </div>

    <div v-if="star.data.garrison" class="row mb-0 pt-3 pb-3 bg-primary">
        <div class="col">
            Ships
        </div>
        <div class="col text-right">
            {{star.data.garrison}} <i class="fas fa-rocket ml-1"></i>
        </div>
    </div>

    <div v-if="star.data.naturalResources" class="row pt-1 pb-1 bg-secondary">
        <div class="col">
            Natural Resources
        </div>
        <div class="col text-right">
            {{star.data.naturalResources}} <i class="fas fa-globe ml-1"></i>
        </div>
    </div>

    <div v-if="star.data.terraformedResources" class="row mb-2 pt-1 pb-1 bg-secondary">
        <div class="col">
            Terraformed Resources
        </div>
        <div class="col text-right">
            {{star.data.terraformedResources}} <i class="fas fa-globe ml-1"></i>
        </div>
    </div>

    <div v-if="star.data.infrastructure">
      <h4 class="pt-2">Infrastructure</h4>

      <infrastructure
        :economy="star.data.infrastructure.economy" :industry="star.data.infrastructure.industry" :science="star.data.infrastructure.science"/>

      <infrastructureUpgrade v-if="getStarOwningPlayer() == getUserPlayer()"
        :gameId="game._id"
        :starId="star.data._id"
        :availableCredits="getUserPlayer().credits"
        :economy="star.data.upgradeCosts.economy" :industry="star.data.upgradeCosts.industry" :science="star.data.upgradeCosts.science"
        v-on:onInfrastructureUpgraded="onInfrastructureUpgraded"/>
    </div>

    <div class="row bg-secondary mt-2" v-if="getUserPlayer() && star.data.manufacturing != null">
      <div class="col text-center pt-3">
        <p>This star builds <b>{{star.data.manufacturing}}</b> every tick.</p>
      </div>
    </div>

    <!-- TODO: Turn these into components -->
    <div v-if="getStarOwningPlayer() == getUserPlayer()" class="mt-2">
      <div class="row bg-secondary pt-2 pb-0 mb-1">
        <div class="col-8">
          <p class="mb-2">Build a carrier to transport ships through hyperspace. <a href="">Read More</a>.</p>
        </div>
        <div class="col-4">
          <modalButton :disabled="getUserPlayer().credits < star.data.upgradeCosts.carriers || star.data.garrison < 1" modalName="buildCarrierModal" classText="btn btn-block btn-primary">Build for ${{star.data.upgradeCosts.carriers}}</modalButton>
        </div>
      </div>

      <div class="row bg-secondary pt-2 pb-0 mb-1">
        <div class="col-8">
          <p class="mb-2">Build a Warp Gate to accelerate carrier movement. <a href="">Read More</a>.</p>
        </div>
        <div class="col-4">
          <modalButton v-if="!star.data.warpGate" :disabled="getUserPlayer().credits < star.data.upgradeCosts.warpGate" modalName="buildWarpGateModal" classText="btn btn-block btn-primary">Build for ${{star.data.upgradeCosts.warpGate}}</modalButton>
          <modalButton v-if="star.data.warpGate" modalName="destroyWarpGateModal" classText="btn btn-block btn-danger">Destroy Gate</modalButton>
        </div>
      </div>

      <div class="row bg-secondary pt-2 pb-0 mb-1">
        <div class="col-8">
          <p class="mb-2">Abandon this star for another player to claim. <a href="">Read More</a>.</p>
        </div>
        <div class="col-4">
          <modalButton modalName="abandonStarModal" classText="btn btn-block btn-danger">Abandon Star</modalButton>
        </div>
      </div>

      <!--
      <h4 class="pt-2 text-success">Premium Features</h4>

      <div class="row">
        <div class="col-8">
          TODO: Wording
          <p class="mb-2">Make your mark on the galaxy by renaming this star. <a href="">Read More</a>.</p>
        </div>
        <div class="col-4">
          <button class="btn btn-block btn-primary">Rename</button>
        </div>
      </div>
      -->
    </div>

    <playerOverview v-if="getStarOwningPlayer()" :game="game" :player="getStarOwningPlayer()" />

    <!-- Modals -->

    <dialogModal v-if="getStarOwningPlayer() == getUserPlayer()" modalName="buildCarrierModal" titleText="Build Carrier" cancelText="No" confirmText="Yes" @onConfirm="confirmBuildCarrier">
      <p>Are you sure you want build a Carrier at <b>{{star.data.name}}</b>?</p>
      <p>The carrier will cost ${{star.data.upgradeCosts.carriers}}.</p>
    </dialogModal>

    <dialogModal v-if="getStarOwningPlayer() == getUserPlayer()" modalName="buildWarpGateModal" titleText="Build Warp Gate" cancelText="No" confirmText="Yes" @onConfirm="confirmBuildWarpGate">
      <p>Are you sure you want build a Warp Gate at <b>{{star.data.name}}</b>?</p>
      <p>The upgrade will cost ${{star.data.upgradeCosts.warpGate}}.</p>
    </dialogModal>

    <dialogModal modalName="destroyWarpGateModal" titleText="Destroy Warp Gate" cancelText="No" confirmText="Yes" @onConfirm="confirmDestroyWarpGate">
      <p>Are you sure you want destroy Warp Gate at <b>{{star.data.name}}</b>?</p>
    </dialogModal>

    <dialogModal modalName="abandonStarModal" titleText="Abandon Star" cancelText="No" confirmText="Yes" @onConfirm="confirmAbandonStar">
      <p>Are you sure you want to abandon <b>{{star.data.name}}</b>?</p>
      <p>It's Economy, Industry and Science will remain, but all ships at this star will be destroyed.</p>
    </dialogModal>
</div>
</template>

<script>
import starService from '../../../services/api/star'
import GameHelper from '../../../services/gameHelper'
import Infrastructure from '../shared/Infrastructure'
import InfrastructureUpgrade from './InfrastructureUpgrade'
import PlayerOverview from '../player/Overview'
import ModalButton from '../../modal/ModalButton'
import DialogModal from '../../modal/DialogModal'

export default {
  components: {
    'infrastructure': Infrastructure,
    'infrastructureUpgrade': InfrastructureUpgrade,
    'playerOverview': PlayerOverview,
    'modalButton': ModalButton,
    'dialogModal': DialogModal
  },
  props: {
    game: Object,
    star: Object
  },
  data () {
    return {
      currentPlayerId: this.getUserPlayer()._id
    }
  },
  methods: {
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.game)
    },
    getStarOwningPlayer () {
      return GameHelper.getStarOwningPlayer(this.game, this.star.data)
    },
    onInfrastructureUpgraded (e) {
      // TODO: Reload the current star to get new costs.
      // TODO: Reload the player credits somehow?
      this.star.data[e]++
      this.getStarOwningPlayer().credits -= this.star.data.upgradeCosts[e]
    },
    async confirmBuildCarrier (e) {
      try {
        let response = await starService.buildCarrier(this.game._id, this.star.data._id)

        if (response.status === 200) {
          // TODO: Refresh somehow.

          this.$emit('onCarrierBuilt', this.star.data._id)
        }
      } catch (err) {
        console.error(err)
      }
    },
    async confirmAbandonStar (e) {
      try {
        let response = await starService.abandonStar(this.game._id, this.star.data._id)

        if (response.status === 200) {
          // TODO: Maybe a better way to refresh this?
          this.star.data.ownedByPlayerId = null
          this.star.data.garrison = 0

          this.$emit('onStarAbandoned', this.star.data._id)
        }
      } catch (err) {
        console.error(err)
      }
    },
    async confirmBuildWarpGate (e) {
      try {
        let response = await starService.buildWarpGate(this.game._id, this.star.data._id)

        if (response.status === 200) {
          // TODO: This doesn't refresh the UI for some reason.
          // Maybe the solution is to put the warp gate value in data instead of a prop?
          this.star.data.warpGate = true

          this.$emit('onUpgradedWarpGate', this.star.data._id)
        }
      } catch (err) {
        console.error(err)
      }
    },
    async confirmDestroyWarpGate (e) {
      try {
        let response = await starService.destroyWarpGate(this.game._id, this.star.data._id)

        if (response.status === 200) {
          this.star.data.warpGate = false

          this.$emit('onDestroyedWarpGate', this.star.data._id)
        }
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

<style scoped>
</style>
