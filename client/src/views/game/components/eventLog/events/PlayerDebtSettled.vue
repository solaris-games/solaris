<template>
<div v-if="debtor && creditor">
  <p v-if="isCreditor">
    <a href="javascript:;" @click="onOpenPlayerDetailRequested(debtor)">{{debtor.alias}}</a> has paid off
    <span class="text-warning">{{event.data.amount}} credits</span> of debt owed to you.
  </p>
  <p v-if="!isCreditor">
      You have paid off <span class="text-warning">{{event.data.amount}} credits</span> of debt owed to
      <a href="javascript:;" @click="onOpenPlayerDetailRequested(creditor)">{{creditor.alias}}</a>.
  </p>
</div>
</template>

<script>
import GameHelper from '../../../../../services/gameHelper'

export default {
  components: {

  },
  props: {
    event: Object
  },
  data () {
    return {
      debtor: null,
      creditor: null,
      isCreditor: false
    }
  },
  mounted () {
    const summary = GameHelper.getLedgerGameEventPlayerSummary(this.$store.state.game, this.event)

    this.debtor = summary.debtor
    this.creditor = summary.creditor
    this.isCreditor = summary.isCreditor
  },
  methods: {
    onOpenPlayerDetailRequested (player) {
      this.$emit('onOpenPlayerDetailRequested', player._id)
    }
  }
}
</script>

<style scoped>
</style>
