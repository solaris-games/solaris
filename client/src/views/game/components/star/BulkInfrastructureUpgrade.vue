<template>
  <div class="menu-page container">
    <menu-title title="Bulk Upgrade" @onCloseRequested="onCloseRequested" />

    <p v-if="!types.length" class="pb-1 text-danger">Bulk upgrade has been disabled in this game. There are no infrastructure types that can be bulk upgraded.</p>

    <div v-if="types.length">
      <div class="row">
        <p class="col-12"><small>Select an amount of credits to spend and the kind of infrastructure you would like to buy. The cheapest infrastructure will be purchased throughout your empire.</small></p>
      </div>

      <form-error-list v-bind:errors="errors"/>

      <form @submit.prevent>
        <div class="row g-0">
          <div class="mb-2 input-group col">
            <span class="input-group-text">
              <i class="fas fa-calculator"></i>
            </span>
            <select class="form-select" id="strategyType" v-on:change="resetPreview" v-model="selectedUpgradeStrategy" :disabled="isChecking || isUpgrading">
              <option value="totalCredits">Spend credits</option>
              <option value="infrastructureAmount">Buy infrastructure amount</option>
              <option value="belowPrice">Buy below price</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="mb-2 input-group col pe-1">
            <span class="input-group-text">
              <i class="fas fa-dollar-sign" v-if="selectedUpgradeStrategy === 'totalCredits'"></i>
              <i class="fas fa-dollar-sign" v-if="selectedUpgradeStrategy === 'belowPrice'"></i>
              <i class="fas fa-industry" v-if="selectedUpgradeStrategy === 'infrastructureAmount'"></i>
            </span>
            <input v-on:input="resetHasChecked"
              class="form-control"
              id="amount"
              v-model="amount"
              type="number"
              required="required"
              :disabled="isChecking || isUpgrading"
            />
          </div>
          <div class="mb-2 col ps-0 pe-0">
            <select class="form-control" id="infrastructureType" v-on:change="resetPreview" v-model="selectedType" :disabled="isChecking || isUpgrading">
              <option
                v-for="opt in types"
                v-bind:key="opt.key"
                v-bind:value="opt.key"
              >{{ opt.name }}</option>
            </select>
          </div>
          <div class="mb-2 col-4 ps-1">
            <div class="d-grid gap-2">
              <button class="btn btn-outline-info" v-on:click="check"
                :disabled="$isHistoricalMode() || isUpgrading || isChecking || gameIsFinished()" ><i class="fas fa-hammer me-1"></i>Check</button>
            </div>
          </div>
        </div>
      </form>

      <loading-spinner :loading="isChecking" />

      <div class="row bg-dark" v-if="hasChecked && !isChecking">
        <div class="col pt-3" >
          <p><b class="text-success">{{upgradeAvailable}}</b> upgrade<span v-if="upgradeAvailable > 1">s</span> for <b class="text-danger">${{cost}}</b></p>
        </div>
        <div class="col-4 pt-2 ps-1">
          <div class="d-grid gap-2">
            <button class="btn btn-success" v-on:click="upgrade"
              :disabled="$isHistoricalMode() || isUpgrading || isChecking || gameIsFinished()" ><i class="fas fa-check me-1"></i>Confirm</button>
          </div>
        </div>
        <div class="col-12" v-if="ignoredCount">
          <p><small>{{ignoredCount}} star(s) have been ignored by the bulk upgrade.</small></p>
        </div>
      </div>

      <div v-if="hasChecked && upgradePreview && upgradePreview.stars.length" class="row mt-2">
        <!-- TODO: This should be a component -->
        <table class="table table-striped table-hover">
          <thead class="table-dark">
              <tr>
                  <td>Star</td>
                  <td class="text-end">Upgrade</td>
                  <td class="text-end"><i class="fas fa-dollar-sign"></i></td>
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
              <td class="text-end">
                <span class="text-danger">{{previewStar.infrastructureCurrent}}</span>
                <i class="fas fa-arrow-right ms-2 me-2"></i>
                <span class="text-success">{{previewStar.infrastructure}}</span>
              </td>
              <td class="text-end">
                {{previewStar.infrastructureCostTotal}}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 class="mt-2">Bulk Ignore Stars</h4>

      <star-table @onOpenStarDetailRequested="onOpenStarDetailRequested" @bulkIgnoreChanged="resetPreview" :highlightIgnoredInfrastructure="selectedType"/>
    </div>
  </div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import FormErrorList from '../../../components/FormErrorList'
import starService from '../../../../services/api/star'
import GameHelper from '../../../../services/gameHelper'
import AudioService from '../../../../game/audio'
import GameContainer from '../../../../game/container'
import BulkInfrastructureUpgradeStarTableVue from './BulkInfrastructureUpgradeStarTable'
import LoadingSpinner from '../../../components/LoadingSpinner'

export default {
  components: {
    'menu-title': MenuTitle,
    'form-error-list': FormErrorList,
    'star-table': BulkInfrastructureUpgradeStarTableVue,
    'loading-spinner': LoadingSpinner
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
      types: []
    }
  },
  mounted () {
    GameContainer.map.showIgnoreBulkUpgrade()

    this.amount = GameHelper.getUserPlayer(this.$store.state.game).credits

    this.setupInfrastructureTypes()
  },
  destroyed () {
    GameContainer.map.hideIgnoreBulkUpgrade()
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', e)
    },
    setupInfrastructureTypes () {
      this.types = []

      if (this.$store.state.game.settings.player.developmentCost.economy !== 'none') {
        this.types.push({
            key: 'economy',
            name: 'Economy'
        })
      }

      if (this.$store.state.game.settings.player.developmentCost.industry !== 'none') {
        this.types.push({
            key: 'industry',
            name: 'Industry'
        })
      }

      if (this.$store.state.game.settings.player.developmentCost.science !== 'none') {
        this.types.push({
            key: 'science',
            name: 'Science'
        })
      }

      this.selectedType = this.types.length ? this.types[0].key : null
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
  }
}
</script>

<style scoped>
</style>
