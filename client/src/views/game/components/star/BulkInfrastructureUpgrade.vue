<template>
  <div class="menu-page container">
    <menu-title title="Bulk Upgrade" @onCloseRequested="onCloseRequested"/>

    <p v-if="!types.length" class="pb-1 text-danger">Bulk upgrade has been disabled in this game. There are no
      infrastructure types that can be bulk upgraded.</p>

    <div v-if="types.length">
      <div class="row">
        <p class="col-12"><small>Select an amount of credits to spend and the kind of infrastructure you would like to
          buy. The cheapest infrastructure will be purchased throughout your empire.</small></p>
      </div>

      <form-error-list v-bind:errors="errors"/>

      <form @submit.prevent>
        <div class="row g-0">
          <div class="mb-2 input-group col">
            <span class="input-group-text">
              <i class="fas fa-calculator"></i>
            </span>
            <select class="form-select" id="strategyType" v-on:change="resetPreview" v-model="selectedUpgradeStrategy"
                    :disabled="isChecking || isUpgrading">
              <option value="totalCredits">Spend credits</option>
              <option value="percentageOfCredits">Spend percentage of credits</option>
              <option value="infrastructureAmount">Buy infrastructure amount</option>
              <option value="belowPrice">Buy below price</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="mb-2 input-group col">
            <span class="input-group-text">
              <i class="fas fa-dollar-sign" v-if="selectedUpgradeStrategy === 'totalCredits'"></i>
              <i class="fas fa-percent" v-if="selectedUpgradeStrategy === 'percentageOfCredits'"></i>
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
          <div class="mb-2 col">
            <select class="form-select" id="infrastructureType" v-on:change="resetPreview" v-model="selectedType"
                    :disabled="isChecking || isUpgrading">
              <option
                v-for="opt in types"
                v-bind:key="opt.key"
                v-bind:value="opt.key"
              >{{ opt.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="mb-2 input-group col">
            <span class="input-group-text">
              <i class="fas fa-hourglass"></i>
            </span>
            <select class="form-select" id="scheduleType" v-on:change="resetPreview" v-model="selectedScheduleStrategy"
                    :disabled="isChecking || isUpgrading">
              <option value="now">Now</option>
              <option value="future">Future</option>
              <option value="cycle-start">Start of cycle</option>
              <option value="cycle-end">End of cycle</option>
            </select>
          </div>
        </div>
        <div class="row" v-if="selectedScheduleStrategy === 'future' || selectedScheduleStrategy === 'cycle-end' || selectedScheduleStrategy === 'cycle-start'">
          <div class="mb-2 input-group col" v-if="selectedScheduleStrategy === 'future'">
            <span class="input-group-text">
              <i class="fas fa-clock"></i>
            </span>
            <input v-on:input="resetHasChecked"
                   class="form-control"
                   id="tick"
                   v-model="tick"
                   type="number"
                   required="required"
                   :disabled="isChecking || isUpgrading"
            />
          </div>
          <div class="mb-2 input-group col">
            <span class="input-group-text">
              <i class="fas fa-sync"></i>
            </span>
            <select class="form-select" id="repeat" v-on:change="resetPreview" v-model="repeat"
                    :disabled="isChecking || isUpgrading">
              <option value="false">One time only</option>
              <option value="true">Repeat every cycle</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="mb-2 col">
            <div class="d-grid">
              <button class="btn btn-outline-info" v-on:click="check"
                      :disabled="$isHistoricalMode() || isUpgrading || isChecking || gameIsFinished()"><i
                class="fas fa-hammer me-1"></i>{{checkText}}
              </button>
            </div>
          </div>
        </div>
      </form>

      <loading-spinner :loading="isChecking"/>

      <div class="row bg-dark" v-if="hasChecked && !isChecking">
        <div class="col pt-3">
          <p><b class="text-success">{{ upgradeAvailable }}</b> upgrade<span v-if="upgradeAvailable > 1">s</span> for <b
            class="text-danger">${{ cost }}</b></p>
        </div>
        <div class="col-4 pt-2 ps-1">
          <div class="d-grid gap-2">
            <button class="btn btn-success" v-on:click="upgrade"
                    :disabled="$isHistoricalMode() || isUpgrading || isChecking || gameIsFinished()"><i
              class="fas fa-check me-1"></i>Confirm
            </button>
          </div>
        </div>
        <div class="col-12" v-if="ignoredCount">
          <p><small>{{ ignoredCount }} star(s) have been ignored by the bulk upgrade.</small></p>
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
              <a href="javascript:;" @click="panToStar(previewStar.starId)">
                <i class="fas fa-eye"></i>
                {{ getStar(previewStar.starId).name }}
              </a>
            </td>
            <td class="text-end">
              <span class="text-danger">{{ previewStar.infrastructureCurrent }}</span>
              <i class="fas fa-arrow-right ms-2 me-2"></i>
              <span class="text-success">{{ previewStar.infrastructure }}</span>
            </td>
            <td class="text-end">
              {{ previewStar.infrastructureCostTotal }}
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div v-if="actionCount > 0">
        <h4 class="mt-2">Scheduled Buy Actions</h4>

        <scheduled-table @bulkScheduleTrashed="onTrashed"/>
      </div>
      <h4 class="mt-2">Bulk Ignore Stars</h4>

      <star-table @onOpenStarDetailRequested="onOpenStarDetailRequested" @bulkIgnoreChanged="resetPreview"
                  :highlightIgnoredInfrastructure="selectedType"/>
    </div>
  </div>
</template>

<script>
import MenuTitle from '../MenuTitle.vue'
import FormErrorList from '../../../components/FormErrorList.vue'
import starService from '../../../../services/api/star'
import GameHelper from '../../../../services/gameHelper'
import AudioService from '../../../../game/audio'
import { inject } from 'vue';
import BulkInfrastructureUpgradeScheduleTable from './BulkInfrastructureUpgradeScheduleTable.vue'
import BulkInfrastructureUpgradeStarTableVue from './BulkInfrastructureUpgradeStarTable.vue'
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";

export default {
  components: {
    'menu-title': MenuTitle,
    'form-error-list': FormErrorList,
    'scheduled-table': BulkInfrastructureUpgradeScheduleTable,
    'star-table': BulkInfrastructureUpgradeStarTableVue,
    'loading-spinner': LoadingSpinner
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  data() {
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
      selectedScheduleStrategy: 'now',
      repeat: 'false',
      tick: this.$store.state.game.state.tick,
      types: [],
      actionCount: 0,
    }
  },
  mounted() {
    this.eventBus.emit(MapCommandEventBusEventNames.MapCommandShowIgnoreBulkUpgrade, {});

    this.amount = GameHelper.getUserPlayer(this.$store.state.game).credits

    this.actionCount = GameHelper.getUserPlayer(this.$store.state.game)?.scheduledActions?.length || 0;

    this.setupInfrastructureTypes()
  },
  unmounted() {
    this.eventBus.emit(MapCommandEventBusEventNames.MapCommandHideIgnoreBulkUpgrade, {});
  },
  computed: {
    checkText() {
      if (this.selectedScheduleStrategy === 'future' || this.selectedScheduleStrategy === 'cycle-end' || this.selectedScheduleStrategy === 'cycle-start') {
        return "Schedule"
      } else {
        return "Check"
      }
    }
  },
  methods: {
    onCloseRequested(e) {
      this.$emit('onCloseRequested', e)
    },
    onOpenStarDetailRequested(e) {
      this.$emit('onOpenStarDetailRequested', e)
    },
    setupInfrastructureTypes() {
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
    resetPreview(e) {
      this.hasChecked = false
      this.upgradePreview = null
    },
    onTrashed() {
      this.actionCount = GameHelper.getUserPlayer(this.$store.state.game)?.scheduledActions?.length || 0;
    },
    panToStar(starId) {
      const star = this.getStar(starId)

      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: star });
    },
    gameIsFinished() {
      return GameHelper.isGameFinished(this.$store.state.game)
    },
    resetHasChecked() {
      this.hasChecked = false
    },
    async check() {
      this.errors = []
      this.upgradePreview = null
      if (this.amount <= 0 || (this.selectedUpgradeStrategy === 'percentageOfCredits' && this.amount > 100)) {
        // We cannot spend 0 or fewer credits and we cannot spend more than 100 percent of what we have.
        return
      }

      if (this.selectedScheduleStrategy === 'future' && this.tick < this.$store.state.game.state.tick) {
        // We cannot schedule actions to happen in the past.
        return
      }

      this.isChecking = true
      if (this.selectedScheduleStrategy === 'future' || this.selectedScheduleStrategy === 'cycle-end' || this.selectedScheduleStrategy === 'cycle-start') {
        if (this.selectedScheduleStrategy === 'cycle-end') {
          const cycleTicks = this.$store.state.game.settings.galaxy.productionTicks;
          const currentTick = this.$store.state.game.state.tick;
          const cycle = Math.floor(currentTick / cycleTicks) + 1;
          this.tick = cycle * cycleTicks - 1;
        } else if (this.selectedScheduleStrategy === 'cycle-start') {
          const cycleTicks = this.$store.state.game.settings.galaxy.productionTicks;
          const currentTick = this.$store.state.game.state.tick;
          const cycle = Math.floor(currentTick / cycleTicks) + 1;
          this.tick = cycle * cycleTicks;
        }

        // When actions are scheduled in the future, they get added to the scheduled list.
        try {
          let response = await starService.scheduleBulkInfrastructureUpgrade(
            this.$store.state.game._id,
            this.selectedUpgradeStrategy,
            this.selectedType,
            this.amount,
            (this.repeat === 'true'),
            this.tick
          )
          if (response.status === 200) {
            AudioService.join()

            this.$store.commit('gameBulkActionAdded', response.data);

            this.actionCount = GameHelper.getUserPlayer(this.$store.state.game)?.scheduledActions?.length || 0;

            this.$toast.success(`Action scheduled. Action will be executed on tick ${response.data.tick}.`)
          }
        } catch (err) {
          this.errors = err.response.data.errors || []
        }
      } else {
        try {
          this.upgradeAvailable = 0
          this.cost = 0
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
            this.hasChecked = true
          }
        } catch (err) {
          this.errors = err.response.data.errors || []
        }
      }
      this.isChecking = false
    },
    async upgrade() {
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

          this.$toast.success(`Upgrade complete. Purchased ${response.data.upgraded} ${this.selectedType} for ${response.data.cost} credits.`)

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
