<template>
  <div class="menu-page container">
    <menu-title title="Bulk Upgrade" @onCloseRequested="onCloseRequested" />

    <div class="row">
      <div class="col-7">
        <p>Select an amount of money to spend and the kind of infrastructure you would like to buy. The cheapest infrastructure will be purchased throughout your empire.</p>
      </div>
      <div class="col-5">
        <form @submit.prevent>
          <div class="form-group input-group">
            <div class="input-group-prepend">
              <span class="input-group-text">$</span>
            </div>
            <input
              class="form-control"
              id="amount"
              v-model="amount"
              type="number"
              required="required"
            />
          </div>
          <div class="form-group">
            <select class="form-control" id="infrastructureType" v-model="selectedType">
              <option
                v-for="opt in types"
                v-bind:key="opt.key"
                v-bind:value="opt.key"
              >{{ opt.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <button class="btn btn-success btn-block" @click="upgrade" :disabled="isUpgrading || gameIsFinished()">Upgrade</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import starService from '../../../services/api/star'
import GameHelper from '../../../services/gameHelper'
import AudioService from '../../../game/audio'

export default {
  components: {
    'menu-title': MenuTitle
  },
  data () {
    return {
      audio: null,
      isUpgrading: false,
      amount: 0,
      selectedType: 'economy',
      types: [
        {
          key: 'economy',
          name: 'Economy'
        },
        {
          key: 'industry',
          name: 'Industry'
        },
        {
          key: 'science',
          name: 'Science'
        }
      ]
    }
  },
  mounted () {
    this.audio = new AudioService(this.$store)

    this.amount = GameHelper.getUserPlayer(this.$store.state.game).credits
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    gameIsFinished () {
      return GameHelper.isGameFinished(this.$store.state.game)
    },
    async upgrade () {
      if (this.amount <= 0) {
        return
      }

      if (!confirm(`Are you sure you want to spend $${this.amount} credits to upgrade ${this.selectedType} across all of your stars?`)) {
        return
      }

      try {
        this.isUpgrading = true

        let response = await starService.bulkInfrastructureUpgrade(
          this.$store.state.game._id,
          this.selectedType,
          this.amount
        )

        if (response.status === 200) {
          this.audio.join()

          this.$emit('onBulkInfrastructureUpgraded', {
            type: this.selectedType,
            amount: this.amount
          })

          this.$toasted.show(`Upgrade complete. Purchased ${response.data.upgraded} ${this.selectedType} for ${response.data.cost} credits.`, { type: 'success' })

          GameHelper.getUserPlayer(this.$store.state.game).credits -= response.data.cost
          this.amount = GameHelper.getUserPlayer(this.$store.state.game).credits
        }
      } catch (err) {
        console.error(err)
      }

      this.isUpgrading = false
    }
  }
}
</script>

<style scoped>
</style>
