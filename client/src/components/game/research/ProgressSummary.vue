<template>
<div class="row bg-primary">
    <div class="col">
      <div class="table-responsive mb-0">
        <table class="table table-sm" v-if="research">
            <tbody>
                <tr>
                    <td>Scanning</td>
                    <td>Level {{research.scanning.level}}</td>
                    <td class="text-right">{{research.scanning.progress}} of {{getRequiredTotal('scanning')}}</td>
                </tr>
                <tr>
                    <td>Hyperspace Range</td>
                    <td>Level {{research.hyperspace.level}}</td>
                    <td class="text-right">{{research.hyperspace.progress}} of {{getRequiredTotal('hyperspace')}}</td>
                </tr>
                <tr>
                    <td>Terraforming</td>
                    <td>Level {{research.terraforming.level}}</td>
                    <td class="text-right">{{research.terraforming.progress}} of {{getRequiredTotal('terraforming')}}</td>
                </tr>
                <tr>
                    <td>Experimentation</td>
                    <td>Level {{research.experimentation.level}}</td>
                    <td class="text-right">{{research.experimentation.progress}} of {{getRequiredTotal('experimentation')}}</td>
                </tr>
                <tr>
                    <td>Weapons</td>
                    <td>Level {{research.weapons.level}}</td>
                    <td class="text-right">{{research.weapons.progress}} of {{getRequiredTotal('weapons')}}</td>
                </tr>
                <tr>
                    <td>Banking</td>
                    <td>Level {{research.banking.level}}</td>
                    <td class="text-right">{{research.banking.progress}} of {{getRequiredTotal('banking')}}</td>
                </tr>
                <tr>
                    <td>Manufacturing</td>
                    <td>Level {{research.manufacturing.level}}</td>
                    <td class="text-right">{{research.manufacturing.progress}} of {{getRequiredTotal('manufacturing')}}</td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'

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
    getRequiredTotal(technologyKey) {
      const game = this.$store.state.game

      const researchCostConfig = game.settings.technology.researchCosts[technologyKey]
      const expenseCostConfig = game.constants.star.infrastructureExpenseMultipliers[researchCostConfig]
      const progressMultiplierConfig = expenseCostConfig * game.constants.research.progressMultiplier

      return this.research[technologyKey].level * progressMultiplierConfig;
    }
  }
}
</script>

<style scoped>
</style>
