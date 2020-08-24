<template>
<div class="row bg-primary" v-if="userPlayer && player">
    <div class="col">
        <div class="table-responsive mb-0">
            <table class="table table-sm">
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
                        <td class="text-right">{{player.research.scanning.level}}</td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.scanning.level > player.research.scanning.level,
                                    'text-danger': userPlayer.research.scanning.level < player.research.scanning.level}">{{userPlayer.research.scanning.level}}</td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-gas-pump"></i></td>
                        <td>Hyperspace Range</td>
                        <td class="text-right">{{player.research.hyperspace.level}}</td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.hyperspace.level > player.research.hyperspace.level,
                                    'text-danger': userPlayer.research.hyperspace.level < player.research.hyperspace.level}">{{userPlayer.research.hyperspace.level}}</td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-globe-europe"></i></td>
                        <td>Terraforming</td>
                        <td class="text-right">{{player.research.terraforming.level}}</td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.terraforming.level > player.research.terraforming.level,
                                    'text-danger': userPlayer.research.terraforming.level < player.research.terraforming.level}">{{userPlayer.research.terraforming.level}}</td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-microscope"></i></td>
                        <td>Experimentation</td>
                        <td class="text-right">{{player.research.experimentation.level}}</td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.experimentation.level > player.research.experimentation.level,
                                    'text-danger': userPlayer.research.experimentation.level < player.research.experimentation.level}">{{userPlayer.research.experimentation.level}}</td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-fighter-jet"></i></td>
                        <td>Weapons</td>
                        <td class="text-right">{{player.research.weapons.level}}</td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.weapons.level > player.research.weapons.level,
                                    'text-danger': userPlayer.research.weapons.level < player.research.weapons.level}">{{userPlayer.research.weapons.level}}</td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-money-bill-alt"></i></td>
                        <td>Banking</td>
                        <td class="text-right">{{player.research.banking.level}}</td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.banking.level > player.research.banking.level,
                                    'text-danger': userPlayer.research.banking.level < player.research.banking.level}">{{userPlayer.research.banking.level}}</td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-industry"></i></td>
                        <td>Manufacturing</td>
                        <td class="text-right">{{player.research.manufacturing.level}}</td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.manufacturing.level > player.research.manufacturing.level,
                                    'text-danger': userPlayer.research.manufacturing.level < player.research.manufacturing.level}">{{userPlayer.research.manufacturing.level}}</td>
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
  }
}
</script>

<style scoped>
.row-icon {
    width: 1%;
}
</style>
