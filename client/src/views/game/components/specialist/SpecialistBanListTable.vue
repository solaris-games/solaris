<template>
    <table class="table table-sm table-striped">
        <thead class="table-dark">
            <th class="col-1"></th>
            <th class="col-8">Name</th>
            <th class="col-1"></th>
            <th class="col-auto text-end">Banned</th>
        </thead>
        <tbody>
            <tr v-for="specialist in specialists" :key="specialist.id">
                <td>
                    <specialist-icon :type="specialistType" :defaultIcon="specialistDefaultIcon" :specialist="specialist"/>
                </td>
                <td>
                    {{specialist.name}}
                </td>
                <td>
                    <help-tooltip :tooltip="specialist.description"/>
                </td>
                <td class="text-end">
                    <div class="form-check float-end" v-if="!game">
                        <input class="form-check-input" type="checkbox" v-model="specialist.banned" v-on:change="onSpecialistBanSelectionChanged">
                    </div>
                    <i class="fas fa-check text-danger" v-if="game && isBanned(specialist)"></i>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script>
import SpecialistIconVue from '../specialist/SpecialistIcon.vue'
import HelpTooltip from '../../../components/HelpTooltip.vue'

export default {
    components: {
        'specialist-icon': SpecialistIconVue,
        'help-tooltip': HelpTooltip,
    },
    props: {
        specialists: Array,
        specialistType: String,
        specialistDefaultIcon: String,
        game: Object
    },
    methods: {
        onSpecialistBanSelectionChanged () {
            this.$emit('onSpecialistBanSelectionChanged')
        },
        isBanned (specialist) {
            const banList = this.game.settings.specialGalaxy.specialistBans[this.specialistType]

            return banList.indexOf(specialist.id) > -1
        }
    }
}
</script>

<style scoped>

</style>
