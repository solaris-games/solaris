<template>
<div class="row bg-primary">
    <div class="col">
      <div class="table-responsive mb-0">
        <table class="table table-sm mb-1" v-if="research">
            <tbody>
                <tr v-if="isTechnologyEnabled('scanning')">
                    <td class="row-icon"><i :class="getIcon('scanning')"></i></td>
                    <td>Scanning</td>
                    <td>
                      <span class="level-label">Level</span>
                      {{research.scanning.level}}
                    </td>
                    <td class="text-right" v-if="isTechnologyResearchable('scanning')">
                      {{research.scanning.progress}}
                      <span class="of-label">of</span>
                      <span class="slash-label">/</span>
                      {{getRequiredTotal('scanning')}}
                    </td>
                    <td v-if="!isTechnologyResearchable('scanning')"></td>
                </tr>
                <tr v-if="isTechnologyEnabled('hyperspace')">
                    <td class="row-icon"><i :class="getIcon('hyperspace')"></i></td>
                    <td>Hyperspace Range</td>
                    <td>
                      <span class="level-label">Level</span>
                      {{research.hyperspace.level}}
                    </td>
                    <td class="text-right" v-if="isTechnologyResearchable('hyperspace')">
                      {{research.hyperspace.progress}}
                      <span class="of-label">of</span>
                      <span class="slash-label">/</span>
                      {{getRequiredTotal('hyperspace')}}
                    </td>
                    <td v-if="!isTechnologyResearchable('hyperspace')"></td>
                </tr>
                <tr v-if="isTechnologyEnabled('terraforming')">
                    <td class="row-icon"><i :class="getIcon('terraforming')"></i></td>
                    <td>Terraforming</td>
                    <td>
                      <span class="level-label">Level</span>
                      {{research.terraforming.level}}
                    </td>
                    <td class="text-right" v-if="isTechnologyResearchable('terraforming')">
                      {{research.terraforming.progress}}
                      <span class="of-label">of</span>
                      <span class="slash-label">/</span>
                      {{getRequiredTotal('terraforming')}}
                    </td>
                    <td v-if="!isTechnologyResearchable('terraforming')"></td>
                </tr>
                <tr v-if="isTechnologyEnabled('experimentation')">
                    <td class="row-icon"><i :class="getIcon('experimentation')"></i></td>
                    <td>Experimentation</td>
                    <td>
                      <span class="level-label">Level</span>
                      {{research.experimentation.level}}
                    </td>
                    <td class="text-right" v-if="isTechnologyResearchable('experimentation')">
                      {{research.experimentation.progress}}
                      <span class="of-label">of</span>
                      <span class="slash-label">/</span>
                      {{getRequiredTotal('experimentation')}}
                    </td>
                    <td v-if="!isTechnologyResearchable('experimentation')"></td>
                </tr>
                <tr v-if="isTechnologyEnabled('weapons')">
                    <td class="row-icon"><i :class="getIcon('weapons')"></i></td>
                    <td>Weapons</td>
                    <td>
                      <span class="level-label">Level</span>
                      {{research.weapons.level}}
                    </td>
                    <td class="text-right" v-if="isTechnologyResearchable('weapons')">
                      {{research.weapons.progress}}
                      <span class="of-label">of</span>
                      <span class="slash-label">/</span>
                      {{getRequiredTotal('weapons')}}
                    </td>
                    <td v-if="!isTechnologyResearchable('scanning')"></td>
                </tr>
                <tr v-if="isTechnologyEnabled('banking')">
                    <td class="row-icon"><i :class="getIcon('banking')"></i></td>
                    <td>Banking</td>
                    <td>
                      <span class="level-label">Level</span>
                      {{research.banking.level}}
                    </td>
                    <td class="text-right" v-if="isTechnologyResearchable('banking')">
                      {{research.banking.progress}}
                      <span class="of-label">of</span>
                      <span class="slash-label">/</span>
                      {{getRequiredTotal('banking')}}
                    </td>
                    <td v-if="!isTechnologyResearchable('banking')"></td>
                </tr>
                <tr v-if="isTechnologyEnabled('manufacturing')">
                    <td class="row-icon"><i :class="getIcon('manufacturing')"></i></td>
                    <td>Manufacturing</td>
                    <td>
                      <span class="level-label">Level</span>
                      {{research.manufacturing.level}}
                    </td>
                    <td class="text-right" v-if="isTechnologyResearchable('manufacturing')">
                      {{research.manufacturing.progress}}
                      <span class="of-label">of</span>
                      <span class="slash-label">/</span>
                      {{getRequiredTotal('manufacturing')}}
                    </td>
                    <td v-if="!isTechnologyResearchable('manufacturing')"></td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import TechnologyHelper from '../../../services/technologyHelper'

export default {
  data: function () {
    return {
      research: null
    }
  },
  mounted () {
    this.research = GameHelper.getUserPlayer(this.$store.state.game).research
  },
  methods: {
    getRequiredTotal (technologyKey) {
      const game = this.$store.state.game

      const researchCostConfig = game.settings.technology.researchCosts[technologyKey]
      const expenseCostConfig = game.constants.star.infrastructureExpenseMultipliers[researchCostConfig]
      const progressMultiplierConfig = expenseCostConfig * game.constants.research.progressMultiplier

      return this.research[technologyKey].level * progressMultiplierConfig
    },
    isTechnologyEnabled (technologyKey) {
      return TechnologyHelper.isTechnologyEnabled(this.$store.state.game, technologyKey)
    },
    isTechnologyResearchable (technologyKey) {
      return TechnologyHelper.isTechnologyResearchable(this.$store.state.game, technologyKey)
    },
    getIcon (technologyKey) {
      return 'fas fa-' + TechnologyHelper.getIcon(technologyKey)
    }
  }
}
</script>

<style scoped>
.row-icon {
    width: 1%;
}

@media screen and (max-width: 576px) { 
  .level-label {
    display: none;
  }

  .of-label {
    display: none;
  }
}

@media screen and (min-width: 577px) { 
  .slash-label {
    display: none;
  }
}
</style>
