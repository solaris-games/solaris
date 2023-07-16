<template>
    <span>
        <span v-if="resources == null">
            <i class="fas fa-globe me-2" v-if="displayIcon && iconAlignLeft"></i>
            <span>???</span>
            <i class="fas fa-globe ms-2" v-if="displayIcon && !iconAlignLeft"></i>
        </span>
        <span v-if="resources && !compareResources && !isSplitResources" title="Resources">
            <i class="fas fa-globe me-2" v-if="displayIcon && iconAlignLeft"></i>
            <span>{{resources.economy}}</span>
            <i class="fas fa-globe ms-2" v-if="displayIcon && !iconAlignLeft"></i>
        </span>
        <span v-if="resources && compareResources && !isSplitResources" title="Natural Resources / Terraformed Resources">
            <i class="fas fa-globe me-2" v-if="displayIcon && iconAlignLeft"></i>
            <span>{{resources.economy}} / {{compareResources.economy}}</span>
            <i class="fas fa-globe ms-2" v-if="displayIcon && !iconAlignLeft"></i>
        </span>
        <span v-if="resources && !compareResources && isSplitResources" title="Resources">
            <i class="fas fa-globe me-2" v-if="displayIcon && iconAlignLeft"></i>
            <span class="text-success" title="Economic Resources">{{resources.economy}}</span>|<span class="text-warning" title="Industrial Resources">{{resources.industry}}</span>|<span class="text-info" title="Science Resources">{{resources.science}}</span>
            <i class="fas fa-globe ms-2" v-if="displayIcon && !iconAlignLeft"></i>
        </span>
        <span v-if="resources && compareResources && isSplitResources" title="Natural Resources / Terraformed Resources">
            <i class="fas fa-globe me-2" v-if="displayIcon && iconAlignLeft"></i>
            <span class="text-success" title="Economic Resources">{{resources.economy}}/{{compareResources.economy}}</span>|<span class="text-warning" title="Industrial Resources">{{resources.industry}}/{{compareResources.industry}}</span>|<span class="text-info" title="Science Resources">{{resources.science}}/{{compareResources.science}}</span>
            <i class="fas fa-globe ms-2" v-if="displayIcon && !iconAlignLeft"></i>
        </span>
    </span>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

export default {
    props: {
        resources: Object,
        compareResources: Object,
        iconAlignLeft: Boolean,
        displayIcon: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        isSplitResources () {
            return GameHelper.isSplitResources(this.$store.state.game)
        }
    }
}
</script>

<style scoped>

</style>