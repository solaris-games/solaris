<template>
  <div class="menu-page container">
    <menu-title title="Bulk Upgrade" @onCloseRequested="onCloseRequested" />

    <div class="row">
      <p class="col-12">Select an amount of money to spend and the kind of infrastructure you would like to buy. The cheapest infrastructure will be purchased throughout your empire.</p>
    </div>

    <form-error-list v-bind:errors="errors"/>

    <form @submit.prevent>
      <div class="row no-gutters mb-2">
        <select class="form-control" id="strategyType" v-on:change="resetPreview" v-model="selectedUpgradeStrategy" :disabled="isChecking || isUpgrading">
          <option value="totalCredits">Spend credits</option>
          <option value="infrastructureAmount">Buy infrastructure amount</option>
          <option value="belowPrice">Buy below price</option>
        </select>
      </div>
      <div class="row no-gutters">
        <div class="form-group input-group col-6 col-sm-4">
          <div class="input-group-prepend">
            <span class="input-group-text">{{ upgradeStrategyUnit }}</span>
          </div>
          <input v-on:input="resetHasChecked"
            class="form-control"
            id="amount"
            v-model="amount"
            type="number"
            required="required"
            :disabled="isChecking || isUpgrading"
          />
        </div>
        <div class="form-group col-6 col-sm-4 pl-1 pr-1">
          <select class="form-control" id="infrastructureType" v-on:change="resetPreview" v-model="selectedType" :disabled="isChecking || isUpgrading">
            <option
              v-for="opt in types"
              v-bind:key="opt.key"
              v-bind:value="opt.key"
            >{{ opt.name }}</option>
          </select>
        </div>
        <div class="form-group col-12 col-sm-4">
          <button class="btn btn-success btn-block" v-on:click="doAction"
                  :disabled="$isHistoricalMode() || isUpgrading || isChecking || gameIsFinished()" ><i class="fas fa-hammer"></i>{{ hasChecked ? " Upgrade" : " Check" }}</button>
        </div>
      </div>
    </form>

    <div v-if="hasChecked" class="row bg-secondary">
      <div class="col text-center pt-3">
        <p v-if="selectedUpgradeStrategy === 'totalCredits'">
          <b class="text-warning">${{previewAmount}}</b> budget: <b class="text-success">{{upgradeAvailable}}</b> upgrades for <b class="text-danger">${{cost}}</b>
        </p>
        <p v-if="selectedUpgradeStrategy === 'infrastructureAmount' || selectedUpgradeStrategy === 'belowPrice'">
          <b class="text-success">{{upgradeAvailable}}</b> upgrades for <b class="text-danger">${{cost}}</b>
        </p>
        <p v-if="ignoredCount"><small>{{ignoredCount}} star(s) have been ignored by the bulk upgrade.</small></p>
      </div>
    </div>

    <div v-if="hasChecked && upgradePreview && upgradePreview.stars.length" class="row">
      <!-- TODO: This should be a component -->
      <table class="table table-striped table-hover mb-1">
        <thead>
            <tr class="bg-primary">
                <td>Star</td>
                <td class="text-right">Upgrade</td>
                <td class="text-right"><i class="fas fa-dollar-sign"></i></td>
            </tr>
        </thead>
        <tbody>
          <!-- TODO: This should be a component -->
          <tr v-for="previewStar in upgradePreview.stars" :key="previewStar.starId">
            <td>
              <a href="javascript:void;" @click="panToStar(previewStar.starId)">
                <i class="fas fa-eye"></i>
                {{getStar(previewStar.starId).name}}
              </a>
            </td>
            <td class="text-right">
              <span class="text-danger">{{previewStar.infrastructureCurrent}}</span>
              <i class="fas fa-arrow-right ml-2 mr-2"></i>
              <span class="text-success">{{previewStar.infrastructure}}</span>
            </td>
            <td class="text-right">
              {{previewStar.infrastructureCostTotal}}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <star-table @onOpenStarDetailRequested="onOpenStarDetailRequested" />
  </div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import FormErrorList from '../../FormErrorList'
import starService from '../../../services/api/star'
import GameHelper from '../../../services/gameHelper'
import AudioService from '../../../game/audio'
import GameContainer from '../../../game/container'
import BulkInfrastructureUpgradeStarTableVue from './BulkInfrastructureUpgradeStarTable'

export default {
  components: {
    'menu-title': MenuTitle,
    'form-error-list': FormErrorList,
    'star-table': BulkInfrastructureUpgradeStarTableVue
  },
  data () {
    return {
      errors: [],
      audio: null,
      isUpgrading: false,
      isChecking: false,
      hasChecked: false,
      upgradePreview: null,
      amount: 0,
      previewAmount: 0,
      upgradeAvailable: 0,
      cost: 0,
      ignoredCount: 0,
      selectedType: 'economy',
      selectedUpgradeStrategy: 'totalCredits',
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
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', e)
    },
    resetPreview (e) {
      this.hasChecked = false
      this.upgradePreview = null
    },
    panToStar (starId) {
      let star = this.getStar(starId)

      GameContainer.map.panToStar(star)
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
      this.errors = []
      this.upgradePreview = null

      if (this.amount <= 0) {
        return
      }

      try {
        this.upgradeAvailable = 0
        this.cost = 0
        this.isChecking = true
        let response = await starService.checkBulkUpgradedAmount(
          this.$store.state.game._id,
          this.selectedUpgradeStrategy,
          this.selectedType,
          this.amount
        )
        if (response.status === 200) {
          AudioService.join()
          this.upgradePreview = response.data
          this.upgradeAvailable = response.data.upgraded
          this.cost = response.data.cost
          this.previewAmount = response.data.budget
          this.ignoredCount = response.data.ignoredCount
        }
      } catch (err) {
        this.errors = err.response.data.errors || []
      }
      this.isChecking = false
      this.hasChecked = true
    },
    async upgrade () {
      this.errors = []

      if (this.cost <= 0 || this.amount <= 0) {
        return
      }

      if (!await this.$confirm('Bulk upgrade', `Are you sure you want to spend $${this.cost} credits to upgrade ${this.selectedType} across all of your stars?`)) {
        return
      }

      try {
        this.isUpgrading = true

        let response = await starService.bulkInfrastructureUpgrade(
          this.$store.state.game._id,
          this.selectedUpgradeStrategy,
          this.selectedType,
          this.amount
        )

        if (response.status === 200) {
          AudioService.join()

          this.$store.commit('gameStarBulkUpgraded', response.data)
          
          this.$toasted.show(`Upgrade complete. Purchased ${response.data.upgraded} ${this.selectedType} for ${response.data.cost} credits.`, { type: 'success' })

          if (this.selectedUpgradeStrategy === 'totalCredits') {
            this.amount = GameHelper.getUserPlayer(this.$store.state.game).credits
          }
        }
      } catch (err) {
        this.errors = err.response.data.errors || []
      }

      this.hasChecked = false
      this.isUpgrading = false
    },
    getStar(starId) {
      return GameHelper.getStarById(this.$store.state.game, starId)
    }
  },
  computed: {
    upgradeStrategyUnit () {
      if (this.selectedUpgradeStrategy === 'totalCredits') {
        return '$'
      } else if (this.selectedUpgradeStrategy === 'belowPrice') {
        return '<$'
      } else if (this.selectedUpgradeStrategy === 'infrastructureAmount') {
        return '1'
      }
    }
  }
}
</script>

<style scoped>
</style>
