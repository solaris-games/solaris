<template>
    <div class="row bg-info" title="This Month's Flux" v-if="flux">
        <div class="col">
            <p class="mt-2 mb-2"><strong><small><i class="fas fa-dice-d20 me-1"></i>{{flux.month}} Flux</small></strong></p>
        </div>
        <div class="col-auto pe-1">
            <!-- <p class="mt-1 mb-1"><small><strong>{{flux.name}}</strong> - {{flux.description}} <help-tooltip v-if="flux.tooltip" :tooltip="flux.tooltip"/></small></p> -->
            <p class="mt-2 mb-2"><small>{{flux.description}} <help-tooltip v-if="flux.tooltip" :tooltip="flux.tooltip"/></small></p>
        </div>
        <div class="col-auto ps-0 mt-1 mb-1">
            <button class="btn btn-sm btn-outline-dark pt-1 pb-1" @click="showSpecBans">
                <i class="fas fa-hammer"></i>
            </button>
        </div>
    </div>
</template>

<script>
import GameApiService from '../../../../services/api/game'
import SpecialistApiService from '../../../../services/api/specialist'
import HelpTooltip from '../../../components/HelpTooltip.vue'

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

                    await this.$confirm(`Ban List`, `This month's bans are as follows.

Star specialists:
${bans.star.map(s => s.name).join(', ')}

Carrier specialists:
${bans.carrier.map(s => s.name).join(', ')}

Special stars:
${bans.specialStar.map(s => s.name).join(', ')}

The ban list affects official games only and changes on the 1st of every month, for information see the wiki.`, 'OK', null, true, false)
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
