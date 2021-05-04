<template>
<div>
  <p>
    A galactic cycle is complete. You have received <span class="text-success">${{event.data.creditsEconomy}}</span> from your
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
  
  <p v-if="event.data.carrierUpkeep">
    The upkeep of <span class="text-warning">{{event.data.carrierUpkeep.carrierCount}} carrier(s)</span> incurred a cost of 
    <span class="text-danger">${{event.data.carrierUpkeep.totalCost}}</span>.
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
