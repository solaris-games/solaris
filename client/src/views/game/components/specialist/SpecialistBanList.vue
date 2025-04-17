<template>
    <div>
        <div id="collapsePanel" class="collapse mb-2">
            <h5>Star Specialists</h5>

            <specialist-ban-list-table
                :specialists="starSpecialists"
                :specialistType="'star'"
                :specialistDefaultIcon="'star'"
                :game="game"/>

            <h5>Carrier Specialists</h5>

            <specialist-ban-list-table
                :specialists="carrierSpecialists"
                :specialistType="'carrier'"
                :specialistDefaultIcon="'rocket'"
                :game="game"/>
        </div>

        <button class="btn btn-primary mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePanel" aria-expanded="false" aria-controls="collapsePanel">
            Toggle Ban List
        </button>
    </div>
</template>

<script>
import SpecialistIconVue from '../specialist/SpecialistIcon.vue'
import SpecialistBanListTable from './SpecialistBanListTable.vue'

export default {
    components: {
        'specialist-icon': SpecialistIconVue,
        'specialist-ban-list-table': SpecialistBanListTable
    },
    props: {
        game: Object
    },
    data () {
        return {
            starSpecialists: [],
            carrierSpecialists: []
        }
    },
    async mounted () {
        await this.$store.dispatch('loadSpecialistData', this.game._id);
        this.starSpecialists = this.$store.state.starSpecialists
        this.carrierSpecialists = this.$store.state.carrierSpecialists
    }
}
</script>

<style scoped>

</style>
