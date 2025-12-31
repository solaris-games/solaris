<template>
<div>
  <p>
    <strong>A galactic cycle has completed!</strong>
  </p>

  <p v-if="event.data.creditsEconomy || event.data.creditsBanking">
    You have received <span class="text-success">${{event.data.creditsEconomy}}</span> from your
    economic infrastructure and <span class="text-success">${{event.data.creditsBanking}}</span> from your banking technology.
  </p>

  <p v-if="event.data.creditsSpecialists">
    You have received <strong><span class="text-success">{{event.data.creditsSpecialists}} specialist token(s)</span></strong> from your
    specialists technology.
  </p>

  <p v-if="event.data.experimentTechnology && !event.data.experimentLevelUp">
    Your experimental scientists have stumbled across a new discovery which has unlocked
    <span class="text-warning">{{event.data.experimentAmount}} points</span> of research in the field of <span class="text-info">{{getTechnologyFriendlyName(event.data.experimentTechnology)}}</span>.
  </p>

  <p v-if="event.data.experimentLevelUp">
    The <span class="text-warning">{{event.data.experimentAmount}} points</span> of research discovered by your experimental scientists caused a <span class="text-warning">breakthrough</span> in the field of <span class="text-info">{{getTechnologyFriendlyName(event.data.experimentTechnology!)}}</span>!
  </p>

  <p v-if="event.data.experimentResearchingNext">
    Your scientists are now researching <span class="text-info">{{getTechnologyFriendlyName(event.data.experimentResearchingNext)}}</span>.
  </p>

  <p v-if="event.data.carrierUpkeep && (event.data.carrierUpkeep.carrierCount || event.data.carrierUpkeep.totalCost)">
    The upkeep of <span class="text-warning">{{event.data.carrierUpkeep.carrierCount}} carrier(s)</span> incurred a cost of
    <span class="text-danger">${{event.data.carrierUpkeep.totalCost}}</span>.
  </p>

  <p v-if="event.data.allianceUpkeep && (event.data.allianceUpkeep.allianceCount || event.data.allianceUpkeep.totalCost)">
    The upkeep of <span class="text-warning">{{event.data.allianceUpkeep.allianceCount}} alliance(s)</span> incurred a cost of
    <span class="text-danger">${{event.data.allianceUpkeep.totalCost}}</span>.
  </p>
</div>
</template>

<script setup lang="ts">
import TechnologyHelper from '../../../../../services/technologyHelper'
import type {PlayerGalacticCycleCompleteEvent, ResearchType} from "@solaris-common";

const props = defineProps<{
  event: PlayerGalacticCycleCompleteEvent<string>,
}>();

const getTechnologyFriendlyName = (key: string) => TechnologyHelper.getFriendlyName(key as ResearchType);
</script>

<style scoped>
</style>
