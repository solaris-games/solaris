<template>
<div class="row">
    <div class="col">
      <div class="table-responsive mb-0">
        <table class="table table-sm mb-1" v-if="research">
            <tbody>
                <tr v-if="isTechnologyEnabled('scanning')">
                    <td class="row-icon"><i :class="getIcon('scanning')"></i></td>
                    <td>
                      Scanning
                    </td>
                    <td>
                      <span class="level-label">Level</span>
                      {{research.scanning.level}}
                    </td>
                    <td class="text-end" v-if="isTechnologyResearchable('scanning')">
                      {{research.scanning.progress}}
                      <span class="of-label">of</span>
                      <span class="slash-label">/</span>
                      {{getRequiredTotal('scanning')}}
                    </td>
                    <td v-if="!isTechnologyResearchable('scanning')"></td>
                    <td class="text-end">
                      <help-tooltip tooltip="Determines how far your stars can see"/>
                    </td>
                </tr>
                <tr v-if="isTechnologyEnabled('hyperspace')">
                    <td class="row-icon"><i :class="getIcon('hyperspace')"></i></td>
                    <td>
                      <span class="label label-default" v-tooltip:bottom="'Determines how far your carriers can travel in a single jump'">Hyperspace Range</span>
                    </td>
                    <td>
                      <span class="level-label">Level</span>
                      {{research.hyperspace.level}}
                    </td>
                    <td class="text-end" v-if="isTechnologyResearchable('hyperspace')">
                      {{research.hyperspace.progress}}
                      <span class="of-label">of</span>
                      <span class="slash-label">/</span>
                      {{getRequiredTotal('hyperspace')}}
                    </td>
                    <td v-if="!isTechnologyResearchable('hyperspace')"></td>
                    <td class="text-end">
                      <help-tooltip tooltip="Determines how far your carriers can travel in a single jump"/>
                    </td>
                </tr>
                <tr v-if="isTechnologyEnabled('terraforming')">
                    <td class="row-icon"><i :class="getIcon('terraforming')"></i></td>
                    <td>
                      Terraforming
                    </td>
                    <td>
                      <span class="level-label">Level</span>
                      {{research.terraforming.level}}
                    </td>
                    <td class="text-end" v-if="isTechnologyResearchable('terraforming')">
                      {{research.terraforming.progress}}
                      <span class="of-label">of</span>
                      <span class="slash-label">/</span>
                      {{getRequiredTotal('terraforming')}}
                    </td>
                    <td v-if="!isTechnologyResearchable('terraforming')"></td>
                    <td class="text-end">
                      <help-tooltip tooltip="Determines infrastructure cost. The higher the terraforming level, the lower infrastructure will cost to upgrade"/>
                    </td>
                </tr>
                <tr v-if="isTechnologyEnabled('experimentation')">
                    <td class="row-icon"><i :class="getIcon('experimentation')"></i></td>
                    <td>
                      Experimentation
                    </td>
                    <td>
                      <span class="level-label">Level</span>
                      {{research.experimentation.level}}
                    </td>
                    <td class="text-end" v-if="isTechnologyResearchable('experimentation')">
                      {{research.experimentation.progress}}
                      <span class="of-label">of</span>
                      <span class="slash-label">/</span>
                      {{getRequiredTotal('experimentation')}}
                    </td>
                    <td v-if="!isTechnologyResearchable('experimentation')"></td>
                    <td class="text-end">
                      <help-tooltip tooltip="Determines how many research points are awarded at the end of the galactic cycle to a random technology"/>
                    </td>
                </tr>
                <tr v-if="isTechnologyEnabled('weapons')">
                    <td class="row-icon"><i :class="getIcon('weapons')"></i></td>
                    <td>
                      Weapons
                    </td>
                    <td>
                      <span class="level-label">Level</span>
                      {{research.weapons.level}}
                    </td>
                    <td class="text-end" v-if="isTechnologyResearchable('weapons')">
                      {{research.weapons.progress}}
                      <span class="of-label">of</span>
                      <span class="slash-label">/</span>
                      {{getRequiredTotal('weapons')}}
                    </td>
                    <td v-if="!isTechnologyResearchable('weapons')"></td>
                    <td class="text-end">
                      <help-tooltip tooltip="Determines combat strength of your ships"/>
                    </td>
                </tr>
                <tr v-if="isTechnologyEnabled('banking')">
                    <td class="row-icon"><i :class="getIcon('banking')"></i></td>
                    <td>
                      Banking
                    </td>
                    <td>
                      <span class="level-label">Level</span>
                      {{research.banking.level}}
                    </td>
                    <td class="text-end" v-if="isTechnologyResearchable('banking')">
                      {{research.banking.progress}}
                      <span class="of-label">of</span>
                      <span class="slash-label">/</span>
                      {{getRequiredTotal('banking')}}
                    </td>
                    <td v-if="!isTechnologyResearchable('banking')"></td>
                    <td class="text-end">
                      <help-tooltip tooltip="Determines how many credits are awarded at the end of the galactic cycle"/>
                    </td>
                </tr>
                <tr v-if="isTechnologyEnabled('manufacturing')">
                    <td class="row-icon"><i :class="getIcon('manufacturing')"></i></td>
                    <td>
                      Manufacturing
                    </td>
                    <td>
                      <span class="level-label">Level</span>
                      {{research.manufacturing.level}}
                    </td>
                    <td class="text-end" v-if="isTechnologyResearchable('manufacturing')">
                      {{research.manufacturing.progress}}
                      <span class="of-label">of</span>
                      <span class="slash-label">/</span>
                      {{getRequiredTotal('manufacturing')}}
                    </td>
                    <td v-if="!isTechnologyResearchable('manufacturing')"></td>
                    <td class="text-end">
                      <help-tooltip tooltip="Determines how many ships are built via industrial infrastructure per tick"/>
                    </td>
                </tr>
                <tr v-if="isTechnologyEnabled('specialists')">
                    <td class="row-icon"><i :class="getIcon('specialists')"></i></td>
                    <td>
                      Specialists
                    </td>
                    <td>
                      <span class="level-label">Level</span>
                      {{research.specialists.level}}
                    </td>
                    <td class="text-end" v-if="isTechnologyResearchable('specialists')">
                      {{research.specialists.progress}}
                      <span class="of-label">of</span>
                      <span class="slash-label">/</span>
                      {{getRequiredTotal('specialists')}}
                    </td>
                    <td v-if="!isTechnologyResearchable('specialists')"></td>
                    <td class="text-end">
                      <help-tooltip tooltip="Determines how many specialist tokens are awarded at the end of the galactic cycle"/>
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
</div>
</template>

<script>
import HelpTooltip from '../../../components/HelpTooltip.vue'
import GameHelper from '../../../../services/gameHelper'
import TechnologyHelper from '../../../../services/technologyHelper'

export default {
  components: {
    'help-tooltip': HelpTooltip
  },
  methods: {
    getRequiredTotal (technologyKey) {
      return TechnologyHelper.getRequiredResearchProgress(this.$store.state.game, technologyKey, this.research[technologyKey].level)
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
  },
  computed: {
    research: function () {
      return GameHelper.getUserPlayer(this.$store.state.game).research
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
