<template>
<div class="row bg-primary">
    <div class="col">
    <table class="table table-sm mb-0" v-if="research">
        <tbody>
            <tr>
                <td>Scanning</td>
                <td>Level {{research.scanning.level}}</td>
                <td class="text-right">{{research.scanning.progress}} of {{getRequiredTotal(research.scanning)}}</td>
            </tr>
            <tr>
                <td>Hyperspace Range</td>
                <td>Level {{research.hyperspace.level}}</td>
                <td class="text-right">{{research.hyperspace.progress}} of {{getRequiredTotal(research.hyperspace)}}</td>
            </tr>
            <tr>
                <td>Terraforming</td>
                <td>Level {{research.terraforming.level}}</td>
                <td class="text-right">{{research.terraforming.progress}} of {{getRequiredTotal(research.terraforming)}}</td>
            </tr>
            <tr>
                <td>Experimentation</td>
                <td>Level {{research.experimentation.level}}</td>
                <td class="text-right">{{research.experimentation.progress}} of {{getRequiredTotal(research.experimentation)}}</td>
            </tr>
            <tr>
                <td>Weapons</td>
                <td>Level {{research.weapons.level}}</td>
                <td class="text-right">{{research.weapons.progress}} of {{getRequiredTotal(research.weapons)}}</td>
            </tr>
            <tr>
                <td>Banking</td>
                <td>Level {{research.banking.level}}</td>
                <td class="text-right">{{research.banking.progress}} of {{getRequiredTotal(research.banking)}}</td>
            </tr>
            <tr>
                <td>Manufacturing</td>
                <td>Level {{research.manufacturing.level}}</td>
                <td class="text-right">{{research.manufacturing.progress}} of {{getRequiredTotal(research.manufacturing)}}</td>
            </tr>
        </tbody>
    </table>
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
    getRequiredTotal(tech) {
      return tech.level * 100; // TODO: This needs to be a constant somewhere.
    }
  }
}
</script>

<style scoped>
</style>
