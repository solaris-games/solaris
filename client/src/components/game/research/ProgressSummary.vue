<template>
<div class="row bg-primary">
    <div class="col">
    <table class="table table-sm mb-0">
        <tbody>
            <tr>
                <td>Scanning</td>
                <td>Level {{research.scanning.level}}</td>
                <td class="text-right">{{research.scanning.progress}} of 0</td>
            </tr>
            <tr>
                <td>Hyperspace Range</td>
                <td>Level {{research.hyperspace.level}}</td>
                <td class="text-right">{{research.hyperspace.progress}} of 0</td>
            </tr>
            <tr>
                <td>Terraforming</td>
                <td>Level {{research.terraforming.level}}</td>
                <td class="text-right">{{research.terraforming.progress}} of 0</td>
            </tr>
            <tr>
                <td>Experimentation</td>
                <td>Level {{research.experimentation.level}}</td>
                <td class="text-right">{{research.experimentation.progress}} of 0</td>
            </tr>
            <tr>
                <td>Weapons</td>
                <td>Level {{research.weapons.level}}</td>
                <td class="text-right">{{research.weapons.progress}} of 0</td>
            </tr>
            <tr>
                <td>Banking</td>
                <td>Level {{research.banking.level}}</td>
                <td class="text-right">{{research.banking.progress}} of 0</td>
            </tr>
            <tr>
                <td>Manufacturing</td>
                <td>Level {{research.manufacturing.level}}</td>
                <td class="text-right">{{research.manufacturing.progress}} of 0</td>
            </tr>
        </tbody>
    </table>
    </div>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'

export default {
  props: {
    game: Object
  },
  data: function () {
    return {
      research: null
    }
  },
  mounted () {
    this.research = GameHelper.getUserPlayer(this.game, this.$store.state.userId).research
  }
}
</script>

<style scoped>
</style>
