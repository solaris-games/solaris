<template>
<div class="pt-2 pb-2">
  <div class="col-12">
    <form-error-list v-bind:errors="errors"/>
  </div>

  <form class="row">
    <div class="col-7">
      <p class="mb-2"><span class="text-warning">{{userPlayer.renownToGive == null ? 0 : userPlayer.renownToGive}} Renown</span> to distribute.</p>
    </div>
    <div class="col-5">
      <div class="d-grid gap-2">
        <button type="button" class="btn btn-success" @click="confirmAwardRenown" :disabled="isAwardingRenown || !userPlayer.renownToGive"><i class="fas fa-heart"></i> Award Renown</button>
      </div>
    </div>
  </form>
</div>
</template>

<script>
import tradeService from '../../../../services/api/trade'
import FormErrorList from '../../../components/FormErrorList.vue'

export default {
  components: {
    'form-error-list': FormErrorList
  },
  props: {
    player: Object,
    userPlayer: Object
  },
  data () {
    return {
      errors: [],
      isAwardingRenown: false,
      amount: 1
    }
  },
  methods: {
    async confirmAwardRenown () {
      this.errors = []
      this.isAwardingRenown = true

      try {
        let response = await tradeService.sendRenown(this.$store.state.game._id, this.player._id, this.amount)

        if (response.status === 200) {
          this.$toast.default(`Sent ${this.amount} renown to ${this.player.alias}.`)

          this.userPlayer.renownToGive -= this.amount

          this.$emit('onRenownSent', this.amount)
        }
      } catch (err) {
        this.errors = err.response.data.errors || []
      }

      this.isAwardingRenown = false
    }
  }
}
</script>

<style scoped>
</style>
