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
import SpecialistService from '../../../../services/api/specialist'
import SpecialistBanListTable from './SpecialistBanListTable.vue'
import { ref, onMounted } from 'vue';
import type {SpecialistBans} from "@solaris-common";

const props = defineProps<{
  specialistBans: SpecialistBans
}>();

const emit = defineEmits<{
  updateSpecialistBans: [bans: SpecialistBans],
}>();

const isLoading = ref(false);
const starSpecialists = ref([]);
const carrierSpecialists = ref([]);

const updateStarBans = (bans: number[]) => {
  emit('updateSpecialistBans', { ...props.specialistBans, star: bans });
};

const updateCarrierBans = (bans: number[]) => {
  emit('updateSpecialistBans', { ...props.specialistBans, carrier: bans });
};

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
