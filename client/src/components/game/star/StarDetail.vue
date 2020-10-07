<template>
<div class="menu-page container" v-if="star">
    <menu-title :title="star.name" @onCloseRequested="onCloseRequested"/>

    <div class="row bg-secondary">
      <div class="col text-center pt-3">
        <p v-if="userPlayer && star.ownedByPlayerId == userPlayer._id">A star under your command.</p>
        <p v-if="star.ownedByPlayerId != null && (!userPlayer || star.ownedByPlayerId != userPlayer._id)">This star is controlled by <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{starOwningPlayer.alias}}</a>.</p>
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
            {{star.naturalResources == null ? '???' : star.naturalResources}} <i class="fas fa-globe ml-1"></i>
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
        <div class="col-auto">
          <i class="fas fa-map-marker-alt"></i>
          <i class="fas fa-sync ml-1" v-if="carrier.waypointsLooped"></i> {{carrier.waypoints.length}}
        </div>
          <div class="col-auto">
              {{carrier.ships == null ? '???' : carrier.ships}} <i class="fas fa-rocket ml-1"></i>
          </div>
      </div>
    </div>

    <div v-if="star.infrastructure">
      <h4 class="pt-2">Infrastructure</h4>

      <infrastructure
        :economy="star.infrastructure.economy" :industry="star.infrastructure.industry" :science="star.infrastructure.science"/>

      <infrastructureUpgrade v-if="isOwnedByUserPlayer && !userPlayer.defeated && star.upgradeCosts != null"
        :star="star"
        :availableCredits="userPlayer.credits"
        :economy="star.upgradeCosts.economy"
        :industry="star.upgradeCosts.industry"
        :science="star.upgradeCosts.science"
        v-on:onInfrastructureUpgraded="onInfrastructureUpgraded"/>
    </div>

    <div class="row bg-secondary mt-2 mb-2" v-if="star.ownedByPlayerId && star.manufacturing != null">
      <div class="col text-center pt-3">
        <p>This star builds <b>{{star.manufacturing}}</b> ships every tick.</p>
      </div>
    </div>

    <!-- TODO: Turn these into components -->
    <div v-if="isOwnedByUserPlayer && !userPlayer.defeated && star.upgradeCosts != null" class="mb-2">
      <div class="row bg-secondary pt-2 pb-0 mb-1">
        <div class="col-8">
          <p class="mb-2">Build a carrier to transport ships through hyperspace. <a href="javascript:;">Read More</a>.</p>
        </div>
        <div class="col-4">
          <modalButton :disabled="userPlayer.credits < star.upgradeCosts.carriers || star.garrison < 1" modalName="buildCarrierModal" classText="btn btn-block btn-primary mb-2">Build for ${{star.upgradeCosts.carriers}}</modalButton>
        </div>
      </div>

      <div class="row bg-secondary pt-2 pb-0 mb-1" v-if="canBuildWarpGates">
        <div class="col-8">
          <p class="mb-2">Build a Warp Gate to accelerate carrier movement. <a href="javascript:;">Read More</a>.</p>
        </div>
        <div class="col-4">
          <modalButton v-if="!star.warpGate" :disabled="userPlayer.credits < star.upgradeCosts.warpGate" modalName="buildWarpGateModal" classText="btn btn-block btn-primary mb-2">Build for ${{star.upgradeCosts.warpGate}}</modalButton>
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

    <h4 class="pt-2" v-if="canShowSpecialist">Specialist</h4>

    <star-specialist v-if="canShowSpecialist" :starId="star._id" @onViewHireStarSpecialistRequested="onViewHireStarSpecialistRequested"/>
<!-- 
    <playerOverview v-if="starOwningPlayer" :playerId="starOwningPlayer._id"
      @onViewConversationRequested="onViewConversationRequested"
      @onViewCompareIntelRequested="onViewCompareIntelRequested"/> -->

    <!-- Modals -->

    <dialogModal v-if="isOwnedByUserPlayer && star.upgradeCosts != null" modalName="buildCarrierModal" titleText="Build Carrier" cancelText="No" confirmText="Yes" @onConfirm="confirmBuildCarrier">
      <p>Are you sure you want build a Carrier at <b>{{star.name}}</b>?</p>
      <p>The carrier will cost ${{star.upgradeCosts.carriers}}.</p>
    </dialogModal>

    <dialogModal v-if="isOwnedByUserPlayer && star.upgradeCosts != null" modalName="buildWarpGateModal" titleText="Build Warp Gate" cancelText="No" confirmText="Yes" @onConfirm="confirmBuildWarpGate">
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
import AudioService from '../../../game/audio'
import GameHelper from '../../../services/gameHelper'
import MenuTitle from '../MenuTitle'
import Infrastructure from '../shared/Infrastructure'
import InfrastructureUpgrade from './InfrastructureUpgrade'
import PlayerOverview from '../player/Overview'
import ModalButton from '../../modal/ModalButton'
import DialogModal from '../../modal/DialogModal'
import StarSpecialistVue from './StarSpecialist'

export default {
  components: {
    'menu-title': MenuTitle,
    'infrastructure': Infrastructure,
    'infrastructureUpgrade': InfrastructureUpgrade,
    'playerOverview': PlayerOverview,
    'modalButton': ModalButton,
    'dialogModal': DialogModal,
    'star-specialist': StarSpecialistVue
  },
  props: {
    starId: String
  },
  data () {
    return {
      audio: null,
      star: null,
      starOwningPlayer: null,
      userPlayer: null,
      currentPlayerId: null,
      canBuildWarpGates: false,
      canShowSpecialist: false
    }
  },
  mounted () {
    this.audio = new AudioService(this.$store)

    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
    this.star = GameHelper.getStarById(this.$store.state.game, this.starId)
    this.starOwningPlayer = GameHelper.getStarOwningPlayer(this.$store.state.game, this.star)

    this.canBuildWarpGates = this.$store.state.game.settings.specialGalaxy.warpgateCost !== 'none'
    
    // Can display specialist section if sepcialists are enabled and the star is owned by a player.
    // Otherwise if the star is unowned then display only if the star is within scanning range and it has a specialist on it.
    this.canShowSpecialist = this.$store.state.game.settings.specialGalaxy.specialistCost !== 'none' 
      && (this.star.specialistId || this.isOwnedByUserPlayer)
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
    onViewHireStarSpecialistRequested (e) {
      this.$emit('onViewHireStarSpecialistRequested', e)
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
      let starOwningPlayer = this.starOwningPlayer

      starOwningPlayer.credits -= e.data.cost

      if (e.data.currentResearchTicksEta != null) {
        starOwningPlayer.currentResearchTicksEta = e.data.currentResearchTicksEta
      }

      this.star.upgradeCosts[e.infrastructureKey] = e.data.nextCost
      this.star.infrastructure[e.infrastructureKey] = e.data.infrastructure

      if (e.data.manufacturing) {
        this.star.manufacturing = e.data.manufacturing
      }
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', this.star.ownedByPlayerId)
    },
    onOpenCarrierDetailRequested (carrier) {
      this.$emit('onOpenCarrierDetailRequested', carrier._id)
    },
    onEditWaypointsRequested (carrier) {
      this.$emit('onEditWaypointsRequested', carrier._id)
    },
    async confirmBuildCarrier (e) {
      try {
        // Build the carrier with the entire star garrison.
        let ships = this.star.garrison

        let response = await starService.buildCarrier(this.$store.state.game._id, this.star._id, ships)

        if (response.status === 200) {
          this.$toasted.show(`Carrier built at ${this.star.name}.`)

          // this.$emit('onCarrierBuilt', this.star._id)
          // this.onOpenCarrierDetailRequested(response.data)
          this.$store.state.game.galaxy.carriers.push(response.data)
          this.onEditWaypointsRequested(response.data)
          this.userPlayer.credits -= this.star.upgradeCosts.carriers

          this.audio.join()
        }
      } catch (err) {
        console.error(err)
      }
    },
    async confirmAbandonStar (e) {
      try {
        let response = await starService.abandonStar(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toasted.show(`${this.star.name} has been abandoned.`)

          // this.$emit('onStarAbandoned', this.star._id)

          this.audio.leave()
        }
      } catch (err) {
        console.error(err)
      }
    },
    async confirmBuildWarpGate (e) {
      try {
        let response = await starService.buildWarpGate(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toasted.show(`Warp Gate built at ${this.star.name}.`)

          // this.$emit('onUpgradedWarpGate', this.star._id)
          GameHelper.getUserPlayer(this.$store.state.game).credits -= response.data.cost

          this.audio.join()
        }
      } catch (err) {
        console.error(err)
      }
    },
    async confirmDestroyWarpGate (e) {
      try {
        let response = await starService.destroyWarpGate(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toasted.show(`Warp Gate destroyed at ${this.star.name}.`)

          // this.$emit('onDestroyedWarpGate', this.star._id)

          this.audio.leave()
        }
      } catch (err) {
        console.error(err)
      }
    }
  },
  computed: {
    isOwnedByUserPlayer: function() {
      let owner = GameHelper.getStarOwningPlayer(this.$store.state.game, this.star)

      return owner && this.userPlayer && owner == this.userPlayer
    }
  }
}
</script>

<style scoped>
</style>
