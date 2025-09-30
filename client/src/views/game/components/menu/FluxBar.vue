<template>
    <div class="row bg-primary" title="This Month's Flux" v-if="flux">
        <p class="mt-2"><strong><i class="fas fa-dice-d20 me-1"></i>{{flux.month}} Flux</strong></p>

        <p>{{flux.description}} <help-tooltip v-if="flux.tooltip" :tooltip="flux.tooltip"/></p>

        <details v-if="monthlyBans">
          <summary>Specialist Bans</summary>

          <div class="m-2">
            <h6>Star specialist bans:</h6>

            <ul>
              <li v-for="specialist of monthlyBans.star">{{ specialist.name }}</li>
            </ul>

            <h6>Carrier specialist bans:</h6>

            <ul>
              <li v-for="specialist of monthlyBans.carrier">{{ specialist.name }}</li>
            </ul>

            <h6>Special star bans:</h6>

            <ul>
              <li v-for="star of monthlyBans.specialStar">{{ star.name }}</li>
            </ul>

            <p>The ban list affects official games only and changes on the 1st of every month, for information see the wiki</p>
          </div>
        </details>
    </div>
</template>

<script setup lang="ts">
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi';
import HelpTooltip from '../../../components/HelpTooltip.vue'
import { ref, inject, type Ref, onMounted } from 'vue';
import { getCurrentFlux } from '@/services/typedapi/game';
import type { Flux, MonthlyBans } from '@solaris-common';
import { listBans } from '@/services/typedapi/specialist';

const httpClient = inject(httpInjectionKey)!;

const flux: Ref<Flux | null> = ref(null);
const monthlyBans: Ref<MonthlyBans | null> = ref(null);

onMounted(async () => {
  const response = await getCurrentFlux(httpClient)();

  if (isOk(response)) {
    flux.value = response.data;
  } else {
    console.error(formatError(response));
  }

  const response2 = await listBans(httpClient)();

  if (isOk(response2)) {
    monthlyBans.value = response2.data;
  } else {
    console.error(formatError(response2));
  }
});
</script>

<style scoped>
.fa-hammer {
    cursor: pointer;
}
</style>
