<template>
    <div>
        <button class="btn btn-primary mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePanel" aria-expanded="false" aria-controls="collapsePanel">
            Toggle Ban List
        </button>

        <div id="collapsePanel" class="collapse mt-2">
            <h5>Star Specialists</h5>

            <loading-spinner :loading="isLoading"/>

            <specialist-ban-list-table v-if="!isLoading"
                :specialists="starSpecialists"
                :specialistType="'star'"
                :specialistDefaultIcon="'star'"
                :readonly="false"
                :bans="specialistBans.star"
                @onBansChanged="updateStarBans"
            />

            <h5>Carrier Specialists</h5>

            <loading-spinner :loading="isLoading"/>

            <specialist-ban-list-table v-if="!isLoading"
                :specialists="carrierSpecialists"
                :specialistType="'carrier'"
                :specialistDefaultIcon="'rocket'"
                :readonly="false"
                :bans="specialistBans.carrier"
                @onBansChanged="updateCarrierBans"
                />
        </div>
    </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import SpecialistBanListTable from './SpecialistBanListTable.vue'
import { ref, inject, onMounted } from 'vue';
import type {Specialist, SpecialistBans} from "@solaris-common";
import {listCarrier, listStar} from "@/services/typedapi/specialist";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";

const props = defineProps<{
  specialistBans: SpecialistBans
}>();

const emit = defineEmits<{
  updateSpecialistBans: [bans: SpecialistBans],
}>();

const httpClient = inject(httpInjectionKey)!;

const isLoading = ref(false);
const starSpecialists = ref<Specialist[]>([]);
const carrierSpecialists = ref<Specialist[]>([]);

const updateStarBans = (bans: number[]) => {
  emit('updateSpecialistBans', { ...props.specialistBans, star: bans });
};

const updateCarrierBans = (bans: number[]) => {
  emit('updateSpecialistBans', { ...props.specialistBans, carrier: bans });
};

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
