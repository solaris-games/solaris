<template>
<div>
  <p>
    A galactic cycle is complete.
  </p>

  <p v-if="event.data.creditsEconomy || event.data.creditsBanking">
    You have received <span class="text-success">${{event.data.creditsEconomy}}</span> from your
    economic infrastructure and <span class="text-success">${{event.data.creditsBanking}}</span> from your banking technology.
  </p>

  <p v-if="event.data.creditsSpecialists">
    You have received <strong><span class="text-success">{{event.data.creditsSpecialists}}</span> specialist token(s)</strong> from your
    specialists technology.
  </p>

  <p v-if="event.data.experimentTechnology">
    Your experimental scientists have stumbled across a new discovery which has unlocked
    <span class="text-warning">{{event.data.experimentAmount}} points</span> of research in the field of <span class="text-info">{{getTechnologyFriendlyName(event.data.experimentTechnology)}}</span>.
  </p>

  <p v-if="event.data.experimentLevelUp">
    Your scientists are now researching <span class="text-info">{{getTechnologyFriendlyName(event.data.experimentResearchingNext)}}</span>.
  </p>

  <p v-if="event.data.carrierUpkeep && (event.data.carrierUpkeep.carrierCount || event.data.carrierUpkeep.totalCost)">
    The upkeep of <span class="text-warning">{{event.data.carrierUpkeep.carrierCount}} carrier(s)</span> incurred a cost of
    <span class="text-danger">${{event.data.carrierUpkeep.totalCost}}</span>.
  </p>

  <p v-if="event.data.allianceUpkeep && (event.data.allianceUpkeep.allianceCount || event.data.allianceUpkeep.totalCost)">
    The upkeep of <span class="text-warning">{{event.data.allianceUpkeep.allyCount}} alliance(s)</span> incurred a cost of
    <span class="text-danger">${{event.data.allianceUpkeep.totalCost}}</span>.
  </p>
</div>
</template>

<script>
import TechnologyHelper from '../../../../services/technologyHelper'

export default {
  components: {

  },
  props: {
    event: Object
  },
  methods: {
    getTechnologyFriendlyName (key) {
      return TechnologyHelper.getFriendlyName(key)
    }
  }
}
</script>

<style scoped>
</style>
