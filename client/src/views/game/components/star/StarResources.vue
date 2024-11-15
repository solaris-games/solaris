<template>
  <td v-if="resources == null && !isSplitResources" class="text-center">
    <i class="fas fa-globe me-2" v-if="displayIcon && iconAlignLeft"></i>
    <span>???</span>
    <i class="fas fa-globe ms-2" v-if="displayIcon && !iconAlignLeft"></i>
  </td>
  <td v-if="resources && !compareResources && !isSplitResources" class="text-end" title="Resources">
    <i class="fas fa-globe me-2" v-if="displayIcon && iconAlignLeft"></i>
    <span>{{resources.economy}}</span>
    <i class="fas fa-globe ms-2" v-if="displayIcon && !iconAlignLeft"></i>
  </td>
  <td v-if="resources && compareResources && !isSplitResources" class="text-end" title="Natural Resources / Terraformed Resources">
    <i class="fas fa-globe me-2" v-if="displayIcon && iconAlignLeft"></i>
    <span>{{resources.economy}} / {{compareResources.economy}}</span>
    <i class="fas fa-globe ms-2" v-if="displayIcon && !iconAlignLeft"></i>
  </td>
  <td v-if="resources == null && isSplitResources" class="text-center">
    <i class="fas fa-globe me-2" v-if="displayIcon && iconAlignLeft"></i>
    <span>???</span>
    <i class="fas fa-globe ms-2" v-if="displayIcon && !iconAlignLeft"></i>
  </td>
  <td v-if="resources == null && isSplitResources" class="text-center">
    <i class="fas fa-globe me-2" v-if="displayIcon && iconAlignLeft"></i>
    <span>???</span>
    <i class="fas fa-globe ms-2" v-if="displayIcon && !iconAlignLeft"></i>
  </td>
  <td v-if="resources == null && isSplitResources" class="text-center">
    <i class="fas fa-globe me-2" v-if="displayIcon && iconAlignLeft"></i>
    <span>???</span>
    <i class="fas fa-globe ms-2" v-if="displayIcon && !iconAlignLeft"></i>
  </td>
  <td v-if="resources && !compareResources && isSplitResources" class="text-end" title="Economy Resources">
    <i class="fas fa-globe me-2" v-if="displayIcon && iconAlignLeft"></i>
    <span class="text-success" title="Economic Resources">{{resources.economy}}</span>
    <i class="fas fa-globe ms-2 me-2" v-if="displayIcon && !iconAlignLeft"></i>
  </td>
  <td v-if="resources && !compareResources && isSplitResources" class="text-end" title="Industry Resources">
    <i class="fas fa-globe me-2" v-if="displayIcon && iconAlignLeft"></i>
    <span class="text-warning" title="Industrial Resources">{{resources.industry}}</span>
    <i class="fas fa-globe ms-2 me-2" v-if="displayIcon && !iconAlignLeft"></i>
  </td>
  <td v-if="resources && !compareResources && isSplitResources" class="text-end" title="Science Resources">
    <i class="fas fa-globe me-2" v-if="displayIcon && iconAlignLeft"></i>
    <span class="text-info" title="Science Resources">{{resources.science}}</span>
    <i class="fas fa-globe ms-2" v-if="displayIcon && !iconAlignLeft"></i>
  </td>
  <td v-if="resources && compareResources && isSplitResources" class="text-end" title="Natural Economy Resources / Terraformed Economy Resources">
    <i class="fas fa-globe me-2" v-if="displayIcon && iconAlignLeft"></i>
    <span class="text-success" title="Economic Resources">{{resources.economy}}/{{compareResources.economy}}</span>
    <i class="fas fa-globe ms-2" v-if="displayIcon && !iconAlignLeft"></i>
  </td>
  <td v-if="resources && compareResources && isSplitResources" class="text-end" title="Natural Industry Resources / Terraformed Industry Resources">
    <i class="fas fa-globe me-2" v-if="displayIcon && iconAlignLeft"></i>
    <span class="text-warning" title="Industrial Resources">{{resources.industry}}/{{compareResources.industry}}</span>
    <i class="fas fa-globe ms-2" v-if="displayIcon && !iconAlignLeft"></i>
  </td>
  <td v-if="resources && compareResources && isSplitResources" class="text-end" title="Natural Science Resources / Terraformed Science Resources">
    <i class="fas fa-globe me-2" v-if="displayIcon && iconAlignLeft"></i>
    <span class="text-info" title="Science Resources">{{resources.science}}/{{compareResources.science}}</span>
    <i class="fas fa-globe ms-2" v-if="displayIcon && !iconAlignLeft"></i>
  </td>
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
