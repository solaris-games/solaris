<template>
<div class="row pt-2 pb-2 bg-secondary">
    <div class="col">
        <form>
            <div class="form-row">
              <div class="col-7">
                  <p class="mb-2">{{userPlayer.renownToGive || 8}} Renown to distribute.</p>
              </div>
              <div class="col-5">
                  <button class="btn btn-success btn-block" @click="confirmAwardRenown">Award Renown</button>
              </div>
            </div>
        </form>
    </div>
</div>
</template>

<script>
import tradeService from '../../../services/api/trade'

export default {
  props: {
    game: Object,
    player: Object,
    userPlayer: Object
  },
  data () {
    return {
      amount: 1
    }
  },
  methods: {
    async confirmAwardRenown () {
      try {
        let response = await tradeService.sendRenown(this.game._id, this.player._id, this.amount)

        if (response.status === 200) {
          this.$emit('onRenownSent', this.amount)

          this.userPlayer.renownToGive -= this.amount
        }
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

<style scoped>
</style>
