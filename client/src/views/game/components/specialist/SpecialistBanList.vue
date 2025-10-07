<template>
  <div>
    <div id="collapsePanel" class="collapse mb-2">
      <h5>Star Specialists</h5>

      <specialist-ban-list-table
        v-if="starSpecialists"
        :specialists="starSpecialists"
        :specialistType="'star'"
        :specialistDefaultIcon="'star'"
        :readonly="true"
        :bans="game.settings.specialGalaxy.specialistBans.star"
      />

      <h5>Carrier Specialists</h5>

      <specialist-ban-list-table
        v-if="carrierSpecialists"
        :specialists="carrierSpecialists"
        :specialistType="'carrier'"
        :specialistDefaultIcon="'rocket'"
        :readonly="true"
        :bans="game.settings.specialGalaxy.specialistBans.carrier"
      />
    </div>

    <button class="btn btn-primary mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePanel"
            aria-expanded="false" aria-controls="collapsePanel">
      Toggle Ban List
    </button>
  </div>
</template>

<script setup lang="ts">
import SpecialistBanListTable from './SpecialistBanListTable.vue'
import { ref, onMounted, inject } from 'vue';
import type {GameSettings, Specialist} from '@solaris-common';
import {listCarrier, listStar} from "@/services/typedapi/specialist";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";

const props = defineProps<{
  game: {
    settings: GameSettings<string>,
  },
}>();

const httpClient = inject(httpInjectionKey)!;

const isLoading = ref(false);
const starSpecialists = ref<Specialist[]>([]);
const carrierSpecialists = ref<Specialist[]>([]);

const loadSpecialists = async () => {
  isLoading.value = true;

  const requests = [
    listCarrier(httpClient)(),
    listStar(httpClient)(),
  ];

  const [carrierResponse, starResponse] = await Promise.all(requests);

  if (isOk(carrierResponse)) {
    carrierSpecialists.value = carrierResponse.data;
  } else {
    console.error(formatError(carrierResponse));
  }

  if (isOk(starResponse)) {
    starSpecialists.value = starResponse.data;
  } else {
    console.error(formatError(starResponse));
  }

  isLoading.value = false;
}

onMounted(async () => {
  await loadSpecialists();
});
</script>

<style scoped>

</style>
