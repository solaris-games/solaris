<template>
<tr>
    <td class="sm-padding text-end">{{action.tick}}</td>
    <td class="sm-padding text-end">{{action.infrastructureType}}</td>
    <td class="sm-padding text-end">{{action.buyType}}</td>
    <td class="sm-padding text-end">{{action.amount}}</td>
    <td class="sm-padding text-end">
      <repeat-bulk-upgrade :action="action" @bulkScheduleRepeatChanged="onRepeatChanged"/>
    </td>
    <td class="last">{{ action.repeat }}    </td>
</tr>
</template>

<script>
import gameContainer from '../../../../game/container'
import RepeatBulkUpgrade from './RepeatBulkUpgrade'

export default {
  components: {
    'repeat-bulk-upgrade': RepeatBulkUpgrade
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
    onRepeatChanged (e) {
      this.$emit('bulkScheduleRepeatChanged', e);
    },
    clickStar (e) {
      this.$emit('onOpenStarDetailRequested', this.star._id)
    },
    goToStar (e) {
      gameContainer.map.panToStar(this.star)
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
