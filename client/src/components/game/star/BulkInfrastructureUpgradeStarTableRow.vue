<template>
<tr>
    <td><a href="javascript:;" @click="clickStar">{{star.name}}</a></td>
    <td class="no-padding"><a href="javascript:;" @click="goToStar"><i class="far fa-eye"></i></a></td>
    <td class="sm-padding"><specialist-icon :type="'star'" :specialist="star.specialist" :hideDefaultIcon="true"></specialist-icon></td>
    <td class="text-right">
      <span v-if="star.infrastructure" class="text-success mr-2" title="Economy">{{star.infrastructure.economy}}</span>
      <span v-if="star.infrastructure" class="text-warning mr-2" title="Industry">{{star.infrastructure.industry}}</span>
      <span v-if="star.infrastructure" class="text-info" title="Science">{{star.infrastructure.science}}</span>
    </td>
    <td class="last">
      <ignore-bulk-upgrade :starId="star._id" :highlightIgnoredInfrastructure="highlightIgnoredInfrastructure" @bulkIgnoreChanged="onBulkIgnoreChanged"/>
    </td>
</tr>
</template>

<script>
import gameContainer from '../../../game/container'
import SpecialistIcon from '../specialist/SpecialistIcon'
import IgnoreBulkUpgradeVue from './IgnoreBulkUpgrade'

export default {
  components: {
    'specialist-icon': SpecialistIcon,
    'ignore-bulk-upgrade': IgnoreBulkUpgradeVue
  },
  props: {
    star: Object,
    highlightIgnoredInfrastructure: String
  },
  data () {
    return {
      audio: null
    }
  },
  methods: {
    onBulkIgnoreChanged (e) {
      this.$emit('bulkIgnoreChanged', e);
    },
    clickStar (e) {
      this.$emit('onOpenStarDetailRequested', this.star._id)
    },
    goToStar (e) {
      gameContainer.map.panToStar(this.star)
    }
  },
  computed: {

  }
}
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}

td.no-padding {
  padding: 12px 0px !important;
}

td.sm-padding {
  padding: 12px 3px !important;
}

td.last {
    width: 1px;
    white-space: nowrap;
}
</style>
