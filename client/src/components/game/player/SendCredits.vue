<template>
<div class="row bg-secondary pt-2 pb-2">
    <div class="col">
        <p class="mb-2">Give this player Credits. (You have ${{userPlayer.cash}})</p>

        <form>
            <div class="form-row">
                <div class="col-7">
                    <input type="number" class="form-control" v-model="cash"/>
                </div>
                <div class="col-5">
                    <modalButton modalName="sendCreditsModal" classText="btn btn-success btn-block">Send Credits</modalButton>
                </div>
            </div>
        </form>
    </div>

    <dialogModal modalName="sendCreditsModal" titleText="Send Credits" cancelText="No" confirmText="Yes" @onConfirm="confirmSendCredits">
      <p>Are you sure you want to send <b>${{cash}}</b> to <b>{{player.alias}}</b>?</p>
    </dialogModal>
</div>
</template>

<script>
import ModalButton from '../../modal/ModalButton'
import DialogModal from '../../modal/DialogModal'

export default {
  props: {
    game: Object,
    player: Object,
    userPlayer: Object
  },
  components: {
    'modalButton': ModalButton,
    'dialogModal': DialogModal
  },
  data () {
      return {
          cash: 0
      }
  },
  methods: {
    confirmSendCredits () {
      // TODO: Call the API
    }
  }
}
</script>

<style scoped>
input {
  text-align: center;
}
</style>
