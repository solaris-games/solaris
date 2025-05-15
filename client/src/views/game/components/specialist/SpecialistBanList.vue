<template>
  <div>
    <div id="collapsePanel" class="collapse mb-2">
      <h5>Star Specialists</h5>

      <specialist-ban-list-table
        v-if="starSpecialists"
        :specialists="starSpecialists"
        :specialistType="'star'"
        :specialistDefaultIcon="'star'"
        :game="game"/>

      <h5>Carrier Specialists</h5>

      <specialist-ban-list-table
        v-if="carrierSpecialists"
        :specialists="carrierSpecialists"
        :specialistType="'carrier'"
        :specialistDefaultIcon="'rocket'"
        :game="game"/>
    </div>

    <button class="btn btn-primary mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePanel"
            aria-expanded="false" aria-controls="collapsePanel">
      Toggle Ban List
    </button>
  </div>
</template>

<script>
import SpecialistIconVue from '../specialist/SpecialistIcon.vue'
import SpecialistBanListTable from './SpecialistBanListTable.vue'
import SpecialistService from "@/services/api/specialist";

export default {
  components: {
    'specialist-icon': SpecialistIconVue,
    'specialist-ban-list-table': SpecialistBanListTable
  },
  props: {
    game: Object
  },
  data() {
    return {
      starSpecialists: [],
      carrierSpecialists: []
    }
  },
  async mounted() {
    this.starSpecialists = (await SpecialistService.getStarSpecialists()).data;
    this.carrierSpecialists = (await SpecialistService.getCarrierSpecialists()).data;
  }
}
</script>

<style scoped>

</style>
