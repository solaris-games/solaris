<template>
<div>
  <p>
      You hired the specialist <span class="text-warning">{{event.data.specialistName}}</span> on the carrier <carrier-label :carrierId="event.data.carrierId" :carrierName="event.data.carrierName"/>.
  </p>
  <p>
    <small><em>{{event.data.specialistDescription}}</em></small>
  </p>
</div>
</template>

<script setup lang="ts">
import CarrierLabel from '../../carrier/CarrierLabel.vue'
import type {PlayerCarrierSpecialistHiredEvent} from "@solaris-common";

const props = defineProps<{
  event: PlayerCarrierSpecialistHiredEvent<string>,
}>();
</script>

<style scoped>
</style>
