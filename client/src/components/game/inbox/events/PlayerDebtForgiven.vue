<template>
<div v-if="debtor && creditor">
  <p v-if="isCreditor">
      You have forgiven <span class="text-warning">${{event.data.amount}}</span> of debt owed to you by  
      <a href="javascript:;" @click="onOpenPlayerDetailRequested(creditor)">{{debtor.alias}}</a>.
  </p>
  <p v-if="!isCreditor">
    <a href="javascript:;" @click="onOpenPlayerDetailRequested(debtor)">{{debtor.alias}}</a> has forgiven  
    <span class="text-warning">${{event.data.amount}}</span> of debt you owed to them.
  </p>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

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
    this.debtor = GameHelper.getPlayerById(this.$store.state.game, this.event.data.debtorPlayerId)
    this.creditor = GameHelper.getPlayerById(this.$store.state.game, this.event.data.creditorPlayerId)

    this.isCreditor = GameHelper.getUserPlayer(this.$store.state.game) == this.creditor
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
