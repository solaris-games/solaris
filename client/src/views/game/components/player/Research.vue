<template>
  <div class="row" v-if="player">
    <div class="col">
      <div class="table-responsive mb-0">
        <table class="table table-sm mb-0">
          <thead class="table-dark">
            <tr v-if="userPlayer && player != userPlayer">
              <th></th>
              <th></th>
              <th></th>
              <th class="text-end">You</th>
            </tr>
          </thead>
          <tbody>
            <research-row
              v-if="isTechnologyEnabled('scanning')"
              research="scanning"
              iconClass="fa-binoculars"
              title="Scanning"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('hyperspace')"
              research="hyperspace"
              iconClass="fa-gas-pump"
              title="Hyperspace Range"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('terraforming')"
              research="terraforming"
              iconClass="fa-globe-europe"
              title="Terraforming"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('experimentation')"
              research="experimentation"
              iconClass="fa-microscope"
              title="Experimentation"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('weapons')"
              research="weapons"
              iconClass="fa-gun"
              title="Weapons"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('banking')"
              research="banking"
              iconClass="fa-money-bill-alt"
              title="Banking"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('manufacturing')"
              research="manufacturing"
              iconClass="fa-industry"
              title="Manufacturing"
              :player="player"
              :userPlayer="userPlayer"
            ></research-row>
            <research-row
              v-if="isTechnologyEnabled('specialists')"
              research="specialists"
              iconClass="fa-user-astronaut"
              title="Specialists"
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
import gameHelper from "../../../../services/gameHelper"
import TechnologyHelper from "../../../../services/technologyHelper"
import ResearchRow from "./ResearchRow.vue"

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
