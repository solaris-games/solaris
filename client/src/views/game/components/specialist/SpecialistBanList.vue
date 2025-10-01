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
import SpecialistService from "@/services/api/specialist";
import { ref, onMounted } from 'vue';
import type { GameSettings } from '@solaris-common';

const props = defineProps<{
  game: {
    settings: GameSettings<string>,
  },
}>();

const isLoading = ref(false);
const starSpecialists = ref([]);
const carrierSpecialists = ref([]);

const loadSpecialists = async () => {
  isLoading.value = true;

  const requests = [
    SpecialistService.getCarrierSpecialists(),
    SpecialistService.getStarSpecialists()
  ];

  const responses = await Promise.all(requests);

  carrierSpecialists.value = responses[0].data;
  starSpecialists.value = responses[1].data;

  isLoading.value = false;
}

onMounted(async () => {
  await loadSpecialists();
});
</script>

<style scoped>

</style>
