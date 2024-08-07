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
                @onSpecialistBanSelectionChanged="onSpecialistBanSelectionChanged"/>

            <h5>Carrier Specialists</h5>

            <loading-spinner :loading="isLoading"/>

            <specialist-ban-list-table v-if="!isLoading"
                :specialists="carrierSpecialists"
                :specialistType="'carrier'"
                :specialistDefaultIcon="'rocket'"
                @onSpecialistBanSelectionChanged="onSpecialistBanSelectionChanged"/>
        </div>
    </div>
</template>

<script>
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import SpecialistService from '../../../../services/api/specialist'
import SpecialistIconVue from '../specialist/SpecialistIcon.vue'
import SpecialistBanListTable from './SpecialistBanListTable.vue'

export default {
    components: {
        'loading-spinner': LoadingSpinner,
        'specialist-icon': SpecialistIconVue,
        'specialist-ban-list-table': SpecialistBanListTable
    },
    data () {
        return {
            isLoading: false,
            starSpecialists: [],
            carrierSpecialists: []
        }
    },
    async mounted () {
        await this.loadSpecialists()
    },
    methods: {
        onSpecialistBanSelectionChanged () {
            let bannedStarSpecs = this.starSpecialists.filter(x => x.banned).map(x => x.id)
            let bannedCarrierSpecs = this.carrierSpecialists.filter(x => x.banned).map(x => x.id)

            this.$emit('onSpecialistBanSelectionChanged', {
                star: bannedStarSpecs,
                carrier: bannedCarrierSpecs
            })
        },
        async loadSpecialists () {
            this.isLoading = true

            let requests = [
                SpecialistService.getCarrierSpecialists(),
                SpecialistService.getStarSpecialists()
            ]

            const responses = await Promise.all(requests)

            this.carrierSpecialists = responses[0].data
            this.starSpecialists = responses[1].data

            this.isLoading = false
        }
    }
}
</script>

<style scoped>

</style>
