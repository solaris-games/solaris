<template>
    <div class="row bg-info" v-if="flux" title="This Month's Flux">
      <div class="col">
        <p class="mt-1 mb-1"><small><i class="fas fa-dice-d20 mr-1"></i>{{flux.month}} Flux</small></p>
      </div>
      <div class="col-auto">
        <!-- <p class="mt-1 mb-1"><small><strong>{{flux.name}}</strong> - {{flux.description}} <help-tooltip v-if="flux.tooltip" :tooltip="flux.tooltip"/></small></p> -->
        <p class="mt-1 mb-1"><small>{{flux.description}} <help-tooltip v-if="flux.tooltip" :tooltip="flux.tooltip"/></small></p>
      </div>
    </div>
</template>

<script>
import GameApiService from '../../../../services/api/game'
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
        try {
            let response = await GameApiService.getCurrentFlux()
            
            if (response.status === 200) {
                this.flux = response.data
            }
        } catch (err) {
            console.error(err)
        }
    }
}
</script>

<style scoped>

</style>