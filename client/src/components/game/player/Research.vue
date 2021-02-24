<template>
<div class="row bg-primary" v-if="userPlayer && player">
    <div class="col">
        <div class="table-responsive mb-0">
            <table class="table table-sm mb-0">
                <thead>
                    <tr v-if="userPlayer && player != userPlayer">
                        <th></th>
                        <th></th>
                        <th></th>
                        <th class="text-right">You</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="row-icon"><i class="fas fa-binoculars"></i></td>
                        <td>Scanning</td>
                        <td class="text-right"
                            :class="{'text-success': userPlayer && player == userPlayer && hasHighestTechLevel('scanning'),
                                    'text-danger': userPlayer && player == userPlayer && hasLowestTechLevel('scanning')}">
                            {{player.research.scanning.level}}
                            <span v-if="player.research.scanning.effective != player.research.scanning.level">({{player.research.scanning.effective}})</span>
                        </td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.scanning.level > player.research.scanning.level,
                                    'text-danger': userPlayer.research.scanning.level < player.research.scanning.level}">
                            {{userPlayer.research.scanning.level}}
                            <span v-if="userPlayer.research.scanning.effective != userPlayer.research.scanning.level">({{userPlayer.research.scanning.effective}})</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-gas-pump"></i></td>
                        <td>Hyperspace Range</td>
                        <td class="text-right"
                            :class="{'text-success': userPlayer && player == userPlayer && hasHighestTechLevel('hyperspace'),
                                    'text-danger': userPlayer && player == userPlayer && hasLowestTechLevel('hyperspace')}">
                            {{player.research.hyperspace.level}}
                            <span v-if="player.research.hyperspace.effective != player.research.hyperspace.level">({{player.research.hyperspace.effective}})</span>
                        </td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.hyperspace.level > player.research.hyperspace.level,
                                    'text-danger': userPlayer.research.hyperspace.level < player.research.hyperspace.level}">
                            {{userPlayer.research.hyperspace.level}}
                            <span v-if="userPlayer.research.hyperspace.effective != userPlayer.research.hyperspace.level">({{userPlayer.research.hyperspace.effective}})</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-globe-europe"></i></td>
                        <td>Terraforming</td>
                        <td class="text-right"
                            :class="{'text-success': userPlayer && player == userPlayer && hasHighestTechLevel('terraforming'),
                                    'text-danger': userPlayer && player == userPlayer && hasLowestTechLevel('terraforming')}">
                            {{player.research.terraforming.level}}
                            <span v-if="player.research.terraforming.effective != player.research.terraforming.level">({{player.research.terraforming.effective}})</span>
                        </td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.terraforming.level > player.research.terraforming.level,
                                    'text-danger': userPlayer.research.terraforming.level < player.research.terraforming.level}">
                            {{userPlayer.research.terraforming.level}}
                            <span v-if="userPlayer.research.terraforming.effective != userPlayer.research.terraforming.level">({{userPlayer.research.terraforming.effective}})</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-microscope"></i></td>
                        <td>Experimentation</td>
                        <td class="text-right"
                            :class="{'text-success': userPlayer && player == userPlayer && hasHighestTechLevel('experimentation'),
                                    'text-danger': userPlayer && player == userPlayer && hasLowestTechLevel('experimentation')}">
                            {{player.research.experimentation.level}}
                            <span v-if="player.research.experimentation.effective != player.research.experimentation.level">({{player.research.experimentation.effective}})</span>
                        </td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.experimentation.level > player.research.experimentation.level,
                                    'text-danger': userPlayer.research.experimentation.level < player.research.experimentation.level}">
                            {{userPlayer.research.experimentation.level}}
                            <span v-if="userPlayer.research.experimentation.effective != userPlayer.research.experimentation.level">({{userPlayer.research.experimentation.effective}})</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-fighter-jet"></i></td>
                        <td>Weapons</td>
                        <td class="text-right"
                            :class="{'text-success': userPlayer && player == userPlayer && hasHighestTechLevel('weapons'),
                                    'text-danger': userPlayer && player == userPlayer && hasLowestTechLevel('weapons')}">
                            {{player.research.weapons.level}}
                            <span v-if="player.research.weapons.effective != player.research.weapons.level">({{player.research.weapons.effective}})</span>
                        </td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.weapons.level > player.research.weapons.level,
                                    'text-danger': userPlayer.research.weapons.level < player.research.weapons.level}">
                            {{userPlayer.research.weapons.level}}
                            <span v-if="userPlayer.research.weapons.effective != userPlayer.research.weapons.level">({{userPlayer.research.weapons.effective}})</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-money-bill-alt"></i></td>
                        <td>Banking</td>
                        <td class="text-right"
                            :class="{'text-success': userPlayer && player == userPlayer && hasHighestTechLevel('banking'),
                                    'text-danger': userPlayer && player == userPlayer && hasLowestTechLevel('banking')}">
                            {{player.research.banking.level}}
                            <span v-if="player.research.banking.effective != player.research.banking.level">({{player.research.banking.effective}})</span>
                        </td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.banking.level > player.research.banking.level,
                                    'text-danger': userPlayer.research.banking.level < player.research.banking.level}">
                            {{userPlayer.research.banking.level}}
                            <span v-if="userPlayer.research.banking.effective != userPlayer.research.banking.level">({{userPlayer.research.banking.effective}})</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-industry"></i></td>
                        <td>Manufacturing</td>
                        <td class="text-right"
                            :class="{'text-success': userPlayer && player == userPlayer && hasHighestTechLevel('manufacturing'),
                                    'text-danger': userPlayer && player == userPlayer && hasLowestTechLevel('manufacturing')}">
                            {{player.research.manufacturing.level}}
                            <span v-if="player.research.manufacturing.effective != player.research.manufacturing.level">({{player.research.manufacturing.effective}})</span>
                        </td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.manufacturing.level > player.research.manufacturing.level,
                                    'text-danger': userPlayer.research.manufacturing.level < player.research.manufacturing.level}">
                            {{userPlayer.research.manufacturing.level}}
                            <span v-if="userPlayer.research.manufacturing.effective != userPlayer.research.manufacturing.level">({{userPlayer.research.manufacturing.effective}})</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
</template>

<script>
import gameHelper from '../../../services/gameHelper'

export default {
  props: {
    playerId: String
  },
  data () {
      return {
          player: null,
          userPlayer: null
      }
  }, 
  mounted () {
      this.player = gameHelper.getPlayerById(this.$store.state.game, this.playerId)
      this.userPlayer = gameHelper.getUserPlayer(this.$store.state.game)
  },
  methods: {
      hasHighestTechLevel (techKey) {
          return gameHelper.userPlayerHasHighestTechLevel(this.$store.state.game, techKey)
      },
      hasLowestTechLevel (techKey) {
          return gameHelper.userPlayerHasLowestTechLevel(this.$store.state.game, techKey)
      }
  }
}
</script>

<style scoped>
.row-icon {
    width: 1%;
}
</style>
