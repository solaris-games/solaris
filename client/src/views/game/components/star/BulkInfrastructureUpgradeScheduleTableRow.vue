<template>
<tr>
    <td class="sm-padding text-center">{{action.tick}}</td>
    <td class="sm-padding">{{getFriendlyText(action.infrastructureType)}}</td>
    <td class="sm-padding">{{getFriendlyText(action.buyType)}}</td>
    <td class="sm-padding">{{action.amount}}</td>
    <td class="sm-padding">
      <repeat-bulk-upgrade :action="action"/>
    </td>
    <td class="last">
      <trash-bulk-upgrade :action="action" @bulkScheduleTrashed="onTrashed"/>
    </td>
</tr>
</template>

<script>
import RepeatBulkUpgrade from './RepeatBulkUpgrade.vue'
import TrashBulkUpgade from './TrashBulkUpgrade.vue'

export default {
  components: {
    'repeat-bulk-upgrade': RepeatBulkUpgrade,
    'trash-bulk-upgrade': TrashBulkUpgade
  },
  props: {
    action: Object,
  },
    data() {
      return {}
},
  methods: {
    onTrashed (e) {
      this.$emit('bulkScheduleTrashed', e)
    },
    getFriendlyText(string) {
      switch (string) {
        case 'economy':
          return 'Economy';
        case 'industry':
          return 'Industry';
        case 'science':
          return 'Science';
        case 'totalCredits':
          return 'Total Credits';
        case 'percentageOfCredits':
          return 'Percentage';
        case 'infrastructureAmount':
          return 'Infrastructure Amount';
        case 'belowPrice':
          return 'Below Price';
        default:
          return ''
      }
    }
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
