<template>
    <div>
        <p>
            Your forces have engaged the enemy in <span class="text-warning">carrier-to-carrier</span> combat.
        </p>
        <div class="table-responsive mt-2">
            <table class="table table-sm" v-if="event">
                <thead>
                    <th></th>
                    <th class="text-right">Before</th>
                    <th class="text-right">Lost</th>
                    <th class="text-right">After</th>
                </thead>
                <tbody>
                    <tr>
                        <td>Carriers: Weapons {{event.data.combatResult.weapons.defender}}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr v-for="carrier of defenderCarriers" :key="carrier._id">
                        <td>
                            <i class="fas fa-rocket mr-2"></i>
                            <span :style="{ 'color': getCarrierColour(carrier._id) }">{{carrier.name}}</span>
                            <span v-if="carrier.specialist" :title="carrier.specialist.description"> ({{carrier.specialist.name}})</span>
                        </td>
                        <td class="text-right">{{carrier.before}}</td>
                        <td class="text-right">{{carrier.lost}}</td>
                        <td class="text-right">{{carrier.after}}</td>
                    </tr>
                    <tr>
                        <td>Carriers: Weapons {{event.data.combatResult.weapons.attacker}}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr v-for="carrier of attackerCarriers" :key="carrier._id">
                        <td>
                            <i class="fas fa-rocket mr-2"></i>
                            <span :style="{ 'color': getCarrierColour(carrier._id) }">{{carrier.name}}</span>
                            <span v-if="carrier.specialist" :title="carrier.specialist.description"> ({{carrier.specialist.name}})</span>
                        </td>
                        <td class="text-right">{{carrier.before}}</td>
                        <td class="text-right">{{carrier.lost}}</td>
                        <td class="text-right">{{carrier.after}}</td>
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
      attackers: [],
      defenderCarriers: [],
      attackerCarriers: []
    }
  },
  mounted () {
    this.defender = GameHelper.getPlayerById(this.$store.state.game, this.event.data.playerIdDefender)
    this.attackers = this.event.data.playerIdAttackers.map(id => GameHelper.getPlayerById(this.$store.state.game, id))

    this.defenderCarriers = this.event.data.combatResult.carriers.filter(c => c.ownedByPlayerId === this.event.data.playerIdDefender)
    this.attackerCarriers = this.event.data.combatResult.carriers.filter(c => c.ownedByPlayerId !== this.event.data.playerIdDefender)
  },
  methods: {
    getCarrierColour (carrierId) {
      let carrier = this.event.data.combatResult.carriers.find(c => c._id === carrierId)
      let playerColour = GameHelper.getPlayerColour(this.$store.state.game, carrier.ownedByPlayerId)

      return playerColour
    }
  }
}
</script>

<style scoped>
</style>
