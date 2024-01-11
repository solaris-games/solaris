<template>
<tr>
    <td class="sm-padding text-auto">{{action.tick}}</td>
    <td class="sm-padding text">{{action.infrastructureType}}</td>
    <td class="sm-padding text-end">{{action.buyType}}</td>
    <td class="sm-padding text-end">{{action.amount}}</td>
    <td class="sm-padding text-end">
      <repeat-bulk-upgrade :action="action"/>
    </td>
    <td class="sm-padding text-end">
      <trash-bulk-upgrade :action="action" @bulkScheduleTrashed="onTrashed"/>
    </td>
</tr>
</template>

<script>
import gameContainer from '../../../../game/container'
import RepeatBulkUpgrade from './RepeatBulkUpgrade'
import TrashBulkUpgade from './TrashBulkUpgrade'

export default {
  components: {
    'repeat-bulk-upgrade': RepeatBulkUpgrade,
    'trash-bulk-upgrade': TrashBulkUpgade
  },
  props: {
    action: Object,
  },
  data () {
    return {
      audio: null
    }
  },
  methods: {
    onTrashed (e) {
      this.$emit('bulkScheduleTrashed', e)
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
