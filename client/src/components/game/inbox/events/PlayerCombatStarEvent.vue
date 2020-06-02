<template>
    <div>
        <p>
            Your forces have engaged the enemy in carrier-to-star combat at 
            <a href="javascript:;" @click="onOpenStarDetailRequested">{{star.name}}</a>.
        </p>
            
        <div class="table-responsive mt-2">
            <table class="table table-sm">
                <thead>
                    <th></th>
                    <th class="text-right">Before</th>
                    <th class="text-right">Lost</th>
                    <th class="text-right">After</th>
                </thead>
                <tbody>
                    <tr>
                        <td>Defender: Weapons {{event.data.combatResult.weapons.defender}}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>
                            <i class="fas fa-star mr-1"></i> 
                            <span class="text-success">{{star.name}}</span>
                        </td>
                        <td class="text-right">{{event.data.combatResult.before.defender}}</td>
                        <td class="text-right">{{event.data.combatResult.after.defender}}</td>
                        <td class="text-right">{{event.data.combatResult.lost.defender}}</td>
                    </tr>
                    <tr>
                        <td>Attacker: Weapons {{event.data.combatResult.weapons.attacker}}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>
                            <i class="fas fa-rocket mr-1"></i> 
                            <span class="text-danger">{{event.data.attackerCarrierName}}</span>
                        </td>
                        <td class="text-right">{{event.data.combatResult.before.attacker}}</td>
                        <td class="text-right">{{event.data.combatResult.after.attacker}}</td>
                        <td class="text-right">{{event.data.combatResult.lost.attacker}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

export default {
  components: {
      
  },
  props: {
    event: Object
  },
  data () {
      return {
          defender: null,
          attacker: null,
          star: null
      }
  },
  mounted () {
    this.defender = GameHelper.getPlayerById(this.$store.state.game, this.event.data.playerIdDefender)
    this.attacker = GameHelper.getPlayerById(this.$store.state.game, this.event.data.playerIdAttacker)
    this.star = GameHelper.getStarById(this.$store.state.game, this.event.data.defenderStarId)
  },
  methods: {
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', this.star)
    }
  }
}
</script>

<style scoped>
</style>
