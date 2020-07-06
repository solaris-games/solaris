<template>
<div class="container">
    <menu-title :title="star.name" @onCloseRequested="onCloseRequested"/>

    <div class="row bg-secondary">
      <div class="col text-center pt-3">
        <p v-if="star.ownedByPlayerId == currentPlayerId">A star under your command.</p>
        <p v-if="star.ownedByPlayerId != null && star.ownedByPlayerId != currentPlayerId">This star is controlled by <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{getStarOwningPlayer().alias}}</a>.</p>
        <p v-if="star.ownedByPlayerId == null">This star has not been claimed by any faction. Send a carrier here to claim it for yourself.</p>
      </div>
    </div>

    <div v-if="star.ownedByPlayerId" class="row mb-0 pt-3 pb-3 bg-primary">
        <div class="col">
            Ships
        </div>
        <div class="col text-right">
            {{star.garrison == null ? '???' : star.garrison}} <i class="fas fa-rocket ml-1"></i>
        </div>
    </div>

    <div class="row pt-1 pb-1 bg-secondary">
        <div class="col">
            Natural Resources
        </div>
        <div class="col text-right">
            {{star.naturalResources || '???'}} <i class="fas fa-globe ml-1"></i>
        </div>
    </div>

    <div v-if="star.ownedByPlayerId" class="row mb-2 pt-1 pb-1 bg-secondary">
        <div class="col">
            Terraformed Resources
        </div>
        <div class="col text-right">
            {{star.terraformedResources || '???'}} <i class="fas fa-globe ml-1"></i>
        </div>
    </div>

    <div v-if="getCarriersInOrbit().length">
      <h4 class="pt-2">Carriers</h4>

      <div v-for="carrier in getCarriersInOrbit()" :key="carrier._id" class="row mb-2 pt-1 pb-1 bg-secondary">
          <div class="col">
            <a href="javascript:;" @click="onOpenCarrierDetailRequested(carrier)">{{carrier.name}}</a>
          </div>
          <div class="col text-right">
              {{carrier.ships}} <i class="fas fa-rocket ml-1"></i>
          </div>
      </div>
    </div>

    <div v-if="star.infrastructure">
      <h4 class="pt-2">Infrastructure</h4>

      <infrastructure
        :economy="star.infrastructure.economy" :industry="star.infrastructure.industry" :science="star.infrastructure.science"/>

      <infrastructureUpgrade v-if="getStarOwningPlayer() == getUserPlayer() && !getUserPlayer().defeated"
        :star="star"
        :availableCredits="getUserPlayer().credits"
        :economy="star.upgradeCosts.economy" 
        :industry="star.upgradeCosts.industry" 
        :science="star.upgradeCosts.science"
        v-on:onInfrastructureUpgraded="onInfrastructureUpgraded"/>
    </div>

    <div class="row bg-secondary mt-2 mb-2" v-if="getUserPlayer() && star.manufacturing != null">
      <div class="col text-center pt-3">
        <p>This star builds <b>{{star.manufacturing}}</b> every tick.</p>
      </div>
    </div>

    <!-- TODO: Turn these into components -->
    <div v-if="getStarOwningPlayer() == getUserPlayer() && !getUserPlayer().defeated" class="mb-2">
      <div class="row bg-secondary pt-2 pb-0 mb-1">
        <div class="col-8">
          <p class="mb-2">Build a carrier to transport ships through hyperspace. <a href="javascript:;">Read More</a>.</p>
        </div>
        <div class="col-4">
          <modalButton :disabled="getUserPlayer().credits < star.upgradeCosts.carriers || star.garrison < 1" modalName="buildCarrierModal" classText="btn btn-block btn-primary mb-2">Build for ${{star.upgradeCosts.carriers}}</modalButton>
        </div>
      </div>

      <div class="row bg-secondary pt-2 pb-0 mb-1">
        <div class="col-8">
          <p class="mb-2">Build a Warp Gate to accelerate carrier movement. <a href="javascript:;">Read More</a>.</p>
        </div>
        <div class="col-4">
          <modalButton v-if="!star.warpGate" :disabled="getUserPlayer().credits < star.upgradeCosts.warpGate" modalName="buildWarpGateModal" classText="btn btn-block btn-primary mb-2">Build for ${{star.upgradeCosts.warpGate}}</modalButton>
          <modalButton v-if="star.warpGate" modalName="destroyWarpGateModal" classText="btn btn-block btn-danger mb-2">Destroy Gate</modalButton>
        </div>
      </div>

      <div class="row bg-secondary pt-2 pb-0 mb-1" v-if="isGameInProgress()">
        <div class="col-8">
          <p class="mb-2">Abandon this star for another player to claim. <a href="javascript:;">Read More</a>.</p>
        </div>
        <div class="col-4">
          <modalButton modalName="abandonStarModal" classText="btn btn-block btn-danger mb-2">Abandon Star</modalButton>
        </div>
      </div>

      <!--
      <h4 class="pt-2 text-success">Premium Features</h4>

      <div class="row">
        <div class="col-8">
          TODO: Wording
          <p class="mb-2">Make your mark on the galaxy by renaming this star. <a href="javascript:;">Read More</a>.</p>
        </div>
        <div class="col-4">
          <button class="btn btn-block btn-primary">Rename</button>
        </div>
      </div>
      -->
    </div>

    <playerOverview v-if="getStarOwningPlayer()" :player="getStarOwningPlayer()" 
      @onViewConversationRequested="onViewConversationRequested"
      @onViewCompareIntelRequested="onViewCompareIntelRequested"/>

    <!-- Modals -->

    <dialogModal v-if="getStarOwningPlayer() == getUserPlayer()" modalName="buildCarrierModal" titleText="Build Carrier" cancelText="No" confirmText="Yes" @onConfirm="confirmBuildCarrier">
      <p>Are you sure you want build a Carrier at <b>{{star.name}}</b>?</p>
      <p>The carrier will cost ${{star.upgradeCosts.carriers}}.</p>
    </dialogModal>

    <dialogModal v-if="getStarOwningPlayer() == getUserPlayer()" modalName="buildWarpGateModal" titleText="Build Warp Gate" cancelText="No" confirmText="Yes" @onConfirm="confirmBuildWarpGate">
      <p>Are you sure you want build a Warp Gate at <b>{{star.name}}</b>?</p>
      <p>The upgrade will cost ${{star.upgradeCosts.warpGate}}.</p>
    </dialogModal>

    <dialogModal modalName="destroyWarpGateModal" titleText="Destroy Warp Gate" cancelText="No" confirmText="Yes" @onConfirm="confirmDestroyWarpGate">
      <p>Are you sure you want destroy Warp Gate at <b>{{star.name}}</b>?</p>
    </dialogModal>

    <dialogModal modalName="abandonStarModal" titleText="Abandon Star" cancelText="No" confirmText="Yes" @onConfirm="confirmAbandonStar">
      <p>Are you sure you want to abandon <b>{{star.name}}</b>?</p>
      <p>It's Economy, Industry and Science will remain, but all ships at this star will be destroyed.</p>
    </dialogModal>
</div>
</template>

<script>
import starService from '../../../services/api/star'
import GameHelper from '../../../services/gameHelper'
import MenuTitle from '../MenuTitle'
import Infrastructure from '../shared/Infrastructure'
import InfrastructureUpgrade from './InfrastructureUpgrade'
import PlayerOverview from '../player/Overview'
import ModalButton from '../../modal/ModalButton'
import DialogModal from '../../modal/DialogModal'

export default {
  components: {
    'menu-title': MenuTitle,
    'infrastructure': Infrastructure,
    'infrastructureUpgrade': InfrastructureUpgrade,
    'playerOverview': PlayerOverview,
    'modalButton': ModalButton,
    'dialogModal': DialogModal
  },
  props: {
    star: Object
  },
  data () {
    return {
      currentPlayerId: this.getUserPlayer()._id
    }
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onViewConversationRequested (e) {
      this.$emit('onViewConversationRequested', e)
    },
    onViewCompareIntelRequested (e) {
      this.$emit('onViewCompareIntelRequested', e)
    },
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    getStarOwningPlayer () {
      return GameHelper.getStarOwningPlayer(this.$store.state.game, this.star)
    },
    getCarriersInOrbit () {
      return GameHelper.getCarriersOrbitingStar(this.$store.state.game, this.star)
    },
    isGameInProgress () {
      return GameHelper.isGameInProgress(this.$store.state.game)
    },
    onInfrastructureUpgraded (e) {
      this.getStarOwningPlayer().credits -= e.data.cost
      this.star.upgradeCosts[e.infrastructureKey] = e.data.nextCost
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', this.getStarOwningPlayer()._id)
    },
    onOpenCarrierDetailRequested (carrier) {
      this.$emit('onOpenCarrierDetailRequested', carrier)
    },
    async confirmBuildCarrier (e) {
      try {
        let response = await starService.buildCarrier(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          // this.$emit('onCarrierBuilt', this.star._id)
        }
      } catch (err) {
        console.error(err)
      }
    },
    async confirmAbandonStar (e) {
      try {
        let response = await starService.abandonStar(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          // this.$emit('onStarAbandoned', this.star._id)
        }
      } catch (err) {
        console.error(err)
      }
    },
    async confirmBuildWarpGate (e) {
      try {
        let response = await starService.buildWarpGate(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          // this.$emit('onUpgradedWarpGate', this.star._id)
        }
      } catch (err) {
        console.error(err)
      }
    },
    async confirmDestroyWarpGate (e) {
      try {
        let response = await starService.destroyWarpGate(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          // this.$emit('onDestroyedWarpGate', this.star._id)
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
