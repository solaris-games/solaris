<template>
    <div class="row bg-info" title="This Month's Flux" v-if="flux">
        <div class="col">
            <p class="mt-1 mb-1"><small><i class="fas fa-dice-d20 me-1"></i>{{flux.month}} Flux</small></p>
        </div>
        <div class="col-auto pe-1">
            <!-- <p class="mt-1 mb-1"><small><strong>{{flux.name}}</strong> - {{flux.description}} <help-tooltip v-if="flux.tooltip" :tooltip="flux.tooltip"/></small></p> -->
            <p class="mt-1 mb-1"><small>{{flux.description}} <help-tooltip v-if="flux.tooltip" :tooltip="flux.tooltip"/></small></p>
        </div>
        <div class="col-auto ps-0">
            <p class="mt-1 mb-1"><small><i class="fas fa-hammer" @click="showSpecBans"></i></small></p>
        </div>
    </div>
</template>

<script>
import GameApiService from '../../../../services/api/game'
import SpecialistApiService from '../../../../services/api/specialist'
import HelpTooltip from '../../../components/HelpTooltip'

export default {
    components: {
        'help-tooltip': HelpTooltip
    },
    data () {
        return {
            flux: null
        }
    },
    async mounted () {
        this.flux = null

        try {
            const response = await GameApiService.getCurrentFlux()

            if (response.status === 200) {
                this.flux = response.data
            }
        } catch (err) {
            console.error(err)
        }
    },
    methods: {
        async showSpecBans () {
            try {
                const response = await SpecialistApiService.listBans()

                if (response.status === 200) {
                    const bans = response.data

                    await this.$confirm(`Specialist Bans`, `This month's specialist bans are as follows.
            
Star specialists:
${bans.star.map(s => s.name).join(', ')}

Carrier specialists:
${bans.carrier.map(s => s.name).join(', ')}

The specialist ban list affects official games only and changes on the 1st of every month, for information see the wiki.`, 'OK', null, true, false)
                }
            } catch (err) {
                console.error(err)
            }
        }
    }
}
</script>

<style scoped>
.fa-hammer {
    cursor: pointer;
}
</style>