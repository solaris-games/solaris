<template>
<div class="container bg-secondary">
    <h3 class="pt-2">{{star.data.name}}</h3>

    <div class="row bg-light">
      <div class="col text-center pt-3">
        <p v-if="star.data.ownedByPlayerId == currentPlayerId">A star under your command.</p>
        <p v-if="star.data.ownedByPlayerId != null && star.data.ownedByPlayerId != currentPlayerId">This star is controlled by [{{getStarOwningPlayer().alias}}].</p>
        <p v-if="star.data.ownedByPlayerId == null">This star has not been claimed by any faction. Send a carrier here to claim it for yourself.</p>
      </div>
    </div>

    <div v-if="star.data.garrison" class="row mb-2 pt-2 pb-2 bg-primary">
        <div class="col">
            Ships
        </div>
        <div class="col text-right">
            {{star.data.garrison}} <i class="fas fa-rocket ml-1"></i>
        </div>
    </div>

    <div v-if="star.data.naturalResources" class="row pt-1 pb-1">
        <div class="col">
            Natural Resources
        </div>
        <div class="col text-right">
            {{star.data.naturalResources}} <i class="fas fa-globe ml-1"></i>
        </div>
    </div>

    <div v-if="star.data.terraformedResources" class="row mb-2 pt-1 pb-1">
        <div class="col">
            Terraformed Resources
        </div>
        <div class="col text-right">
            {{star.data.terraformedResources}} <i class="fas fa-globe ml-1"></i>
        </div>
    </div>

    <div v-if="star.data.economy != null">
      <h4 class="pt-2">Infrastructure</h4>

      <infrastructure
        :economy="star.data.economy" :industry="star.data.industry" :science="star.data.science"/>

      <infrastructureUpgrade v-if="getStarOwningPlayer() == getUserPlayer()"
        :economy="star.data.upgradeCosts.economy" :industry="star.data.upgradeCosts.industry" :science="star.data.upgradeCosts.science"
        v-on:onInfrastructureUpgraded="onInfrastructureUpgraded"/>
    </div>

    <div class="row bg-secondary" v-if="star.data.shipsPerTick != null">
      <div class="col text-center pt-3">
        <p>This star builds <b>{{star.data.shipsPerTick}}</b> every tick.</p>
      </div>
    </div>

    <!-- TODO: Turn these into components -->
    <div v-if="getStarOwningPlayer() == getUserPlayer()" class="mt-3">
      <div class="row">
        <div class="col-8">
          <p>Buy a carrier to transport ships through hyperspace. <a href="">Read More</a>.</p>
        </div>
        <div class="col-4">
          <button class="btn btn-block btn-primary">Buy for $0</button>
        </div>
      </div>

      <div class="row">
        <div class="col-8">
          <p>Buy a Warp Gate to accelerate carrier movement. <a href="">Read More</a>.</p>
        </div>
        <div class="col-4">
          <button class="btn btn-block btn-primary">Buy for $0</button>
        </div>
      </div>

      <div class="row">
        <div class="col-8">
          <p>Abandon this star for another player to claim. <a href="">Read More</a>.</p>
        </div>
        <div class="col-4">
          <modalButton modalName="abandonStarModal" classText="btn btn-block btn-danger">Abandon Star</modalButton>
        </div>
      </div>

      <h4 class="pt-2 text-success">Premium Features</h4>

      <div class="row">
        <div class="col-8">
          <!-- TODO: Wording -->
          <p>Make your mark on the galaxy by renaming this star. <a href="">Read More</a>.</p>
        </div>
        <div class="col-4">
          <button class="btn btn-block btn-primary">Rename</button>
        </div>
      </div>
    </div>

    <playerOverview :game="game" :player="getStarOwningPlayer()" />

    <dialogModal modalName="abandonStarModal" titleText="Abandon Star" cancelText="No" confirmText="Yes" @onConfirm="confirmAbandonStar">
      <p>Are you sure you want to abandon <b>{{star.data.name}}</b>?</p>
      <p>It's Economy, Industry and Science will remain, but all ships at this star will be destroyed.</p>
    </dialogModal>
</div>
</template>

<script>
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
      return GameHelper.getUserPlayer(this.game, this.$store.state.userId)
    },
    getStarOwningPlayer () {
      return GameHelper.getStarOwningPlayer(this.game, this.star.data)
    },
    onInfrastructureUpgraded (e) {
      // TODO: Reload the current star to get new costs.
      // TODO: Reload the player cash somehow?
      this.star.data[e]++
      this.getStarOwningPlayer().cash -= this.star.data.upgradeCosts[e]
    },
    confirmAbandonStar (e) {
      // TODO: Call the API to abandon the star.
      // TODO: Refresh the star afterwards
    }
  }
}
</script>

<style scoped>
</style>
