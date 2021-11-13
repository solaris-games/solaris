<template>
  <div class="row bg-primary" v-if="player">
    <div class="col">
      <div class="table-responsive mb-0">
        <table class="table table-sm mb-0">
          <thead>
            <tr v-if="userPlayer && player != userPlayer">
              <th></th>
              <th></th>
              <th></th>
              <th class="text-right">You</th>
            </tr>
          </thead>
          <tbody>
            <research-row
              v-if="isTechnologyEnabled('scanning')"
              research="scanning"
              iconClass="fa-binoculars"
              title="Scaning"
              subtitle="Determines how far your star's can see"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('hyperspace')"
              research="hyperspace"
              iconClass="fa-gas-pump"
              title="Hyperspace Range"
              subtitle="Determines how far your carriers can travel in a single jump"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('terraforming')"
              research="terraforming"
              iconClass="fa-globe-europe"
              title="Terraforming"
              subtitle="Determines infrastructure cost. The higher the terraforming level, the lower infrastructure will cost to upgrade"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('experimentation')"
              research="experimentation"
              iconClass="fa-microscope"
              title="Experimentation"
              subtitle="Determines how many research points are awarded at the end of the galactic cycle to a random technology"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('weapons')"
              research="weapons"
              iconClass="fa-fighter-jet"
              title="Weapons"
              subtitle="Determines combat strength of your ships"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('banking')"
              research="banking"
              iconClass="fa-money-bill-alt"
              title="Banking"
              subtitle="Determines how many credits are awarded at the end of the galactic cycle"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('manufacturing')"
              research="manufacturing"
              iconClass="fa-industry"
              title="Manufacturing"
              subtitle="Determines how many ships are built via industrial infrastructure per tick"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('specialists')"
              research="specialists"
              iconClass="fa-user-astronaut"
              title="Specialists"
              subtitle="Determines how many specialist tokens are awarded at the end of the galactic cycle"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import gameHelper from "../../../services/gameHelper"
import TechnologyHelper from "../../../services/technologyHelper"
import ResearchRow from "./ResearchRow"

export default {
  components: {
    "research-row": ResearchRow,
  },
  props: {
    playerId: String,
  },
  methods: {
    isTechnologyEnabled (technologyKey) {
      return TechnologyHelper.isTechnologyEnabled(this.$store.state.game, technologyKey)
    },
    isTechnologyResearchable (technologyKey) {
      return TechnologyHelper.isTechnologyResearchable(this.$store.state.game, technologyKey)
    }
  },
  computed: {
    player() {
      return gameHelper.getPlayerById(this.$store.state.game, this.playerId);
    },
    userPlayer() {
      return gameHelper.getUserPlayer(this.$store.state.game);
    },
  },
};
</script>

<style scoped>
.row-icon {
  width: 1%;
}
</style>
