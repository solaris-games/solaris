<template>
<div class="row bg-secondary pt-2 pb-2">
  <div class="col-12">
    <form-error-list v-bind:errors="errors"/>
  </div>

  <div class="col-12">
    <p class="mb-2">Give this player <strong>Specialist Tokens</strong>. (You have <span class="text-warning">{{userPlayer.creditsSpecialists}}</span>)</p>

    <form>
      <div class="form-row">
        <div class="col-7 input-group">
          <div class="input-group-prepend">
            <span class="input-group-text">
              <i class="fas fa-user-astronaut"></i>
            </span>
          </div>
          <input type="number" class="form-control" v-model="amount"/>
        </div>
        <div class="col-5">
          <modalButton modalName="sendCreditsSpecialistsModal" classText="btn btn-success btn-block" :disabled="$isHistoricalMode() || isSendingCredits"><i class="fas fa-paper-plane"></i> Send</modalButton>
        </div>
      </div>
    </form>
  </div>

  <dialogModal modalName="sendCreditsSpecialistsModal" titleText="Send Specialist Tokens" cancelText="No" confirmText="Yes" @onConfirm="confirmSendCredits">
    <p>Are you sure you want to send <b>{{amount}}</b> specialist token(s) to <b>{{player.alias}}</b>?</p>
  </dialogModal>
</div>
</template>

<script>
import tradeService from '../../../services/api/trade'
import ModalButton from '../../modal/ModalButton'
import DialogModal from '../../modal/DialogModal'
import FormErrorList from '../../FormErrorList.vue'

export default {
  props: {
    player: Object,
    userPlayer: Object
  },
  components: {
    'modalButton': ModalButton,
    'dialogModal': DialogModal,
    'form-error-list': FormErrorList
  },
  data () {
    return {
      errors: [],
      isSendingCredits: false,
      amount: 0
    }
  },
  methods: {
    async confirmSendCredits () {
      this.errors = []
      this.isSendingCredits = true

      try {
        let response = await tradeService.sendCreditsSpecialists(this.$store.state.game._id, this.player._id, this.amount)

        if (response.status === 200) {
          this.$emit('onCreditsSpecialistsSent', this.amount)

          this.$toasted.show(`Sent ${this.amount} specialist token(s) to ${this.player.alias}.`)

          this.userPlayer.creditsSpecialists -= this.amount
          this.amount = 0

          this.player.reputation = response.data.reputation
        }
      } catch (err) {
        this.errors = err.response.data.errors || []
      }

      this.isSendingCredits = false
    }
  }
}
</script>

<style scoped>
input {
  text-align: center;
}
</style>
