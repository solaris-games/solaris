<template>
  <div class="menu-page container">
    <menu-title title="Bulk Upgrade" @onCloseRequested="onCloseRequested" />

    <div class="row">
      <p class="col-12">Select an amount of money to spend and the kind of infrastructure you would like to buy. The cheapest infrastructure will be purchased throughout your empire.</p>
    </div>

    <form class="row no-gutters" @submit.prevent>
      <div class="form-group input-group col-4 pr-1">
        <div class="input-group-prepend">
          <span class="input-group-text">$</span>
        </div>
        <input v-on:input="resetHasChecked"
          class="form-control"
          id="amount"
          v-model="amount"
          type="number"
          required="required"
        />
      </div>
      <div class="form-group col-4">
        <select class="form-control" id="infrastructureType" v-on:change="hasChecked = false" v-model="selectedType">
          <option
            v-for="opt in types"
            v-bind:key="opt.key"
            v-bind:value="opt.key"
          >{{ opt.name }}</option>
        </select>
      </div>
      <div class="form-group col-4 pl-1">
        <button class="btn btn-success btn-block" v-on="doAction"
                :disabled="isUpgrading || isChecking || gameIsFinished()" ><i class="fas fa-hammer"></i>{{ this.hasChecked ? " Upgrade" : " Check" }}</button>
      </div>
    </form>
    <div v-if="hasChecked" class="row bg-secondary">
      <div class="col text-center pt-2">
        <p><b>${{this.amount}}</b> budget: <b>{{this.upgradeAvailable}}</b> upgrades for <b>${{this.cost}}</b></p>
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
      isChecking: false,
      hasChecked: false,
      amount: 0,
      upgradeAvailable: 0,
      cost: 0,
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
    this.amount = GameHelper.getUserPlayer(this.$store.state.game).credits
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    gameIsFinished () {
      return GameHelper.isGameFinished(this.$store.state.game)
    },
    resetHasChecked () {
      this.hasChecked = false
    },
    doAction () {
      this.hasChecked ? this.upgrade() : this.check()
    },
    async check () {
      if (this.amount <= 0) {
        return
      }
      try {
        this.isChecking = true

        let response = await starService.checkBulkUpgradedAmount(
          this.$store.state.game._id,
          this.selectedType,
          this.amount
        )

        if (response.status === 200) {
          AudioService.join()
          this.upgradeAvailable = response.data.canUpgrade
          this.cost = response.data.cost
        }
      } catch (err) {
        console.error(err)
      }

      this.isChecking = false
      this.hasChecked = true
    },
    async upgrade () {
      if (this.cost <= 0) {
        return
      }

      if (!confirm(`Are you sure you want to spend $${this.cost} credits to upgrade ${this.selectedType} across all of your stars?`)) {
        return
      }

      try {
        this.isUpgrading = true

        let response = await starService.bulkInfrastructureUpgrade(
          this.$store.state.game._id,
          this.selectedType,
          this.cost
        )

        if (response.status === 200) {
          AudioService.join()

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

      this.hasChecked = false
      this.isUpgrading = false
    }
  }
}
</script>

<style scoped>
</style>
