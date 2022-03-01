<template>
    <div>
        <p>
            Your forces have engaged the enemy in <span class="text-warning">carrier-to-carrier</span> combat.
        </p>
        <div class="table-responsive mt-2">
            <table class="table table-sm" v-if="event">
                <thead>
                    <th>Carriers</th>
                    <th class="text-right">Before</th>
                    <th class="text-right">Lost</th>
                    <th class="text-right">After</th>
                </thead>
                <tbody>
                    <tr>
                        <td><i>Weapons {{event.data.combatResult.weapons.defender}} <span v-if="event.data.combatResult.weapons.defenderBase !== event.data.combatResult.weapons.defender">(base {{event.data.combatResult.weapons.defenderBase}})</span></i></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr v-for="carrier of defenderCarriers" :key="carrier._id">
                        <td>
                            <i class="fas fa-rocket mr-2"></i>
                            <span :style="{ 'color': getCarrierColour(carrier) }" class="name-and-icon">
                              <player-icon-shape :filled="true" :shape="getCarrierShape(carrier)" :iconColour="getCarrierColour(carrier)" />
                              {{carrier.name}}
                            </span>
                            <span v-if="carrier.specialist" :title="carrier.specialist.description"> ({{carrier.specialist.name}})</span>
                        </td>
                        <td class="text-right">{{carrier.before}}</td>
                        <td class="text-right">{{carrier.lost}}</td>
                        <td class="text-right">{{carrier.after}}</td>
                    </tr>
                    <tr>
                      <td><strong>Totals</strong></td>
                      <td class="text-right"><strong>{{totalDefenderBefore}}</strong></td>
                      <td class="text-right"><strong>{{totalDefenderLost}}</strong></td>
                      <td class="text-right"><strong>{{totalDefenderAfter}}</strong></td>
                    </tr>
                </tbody>
            </table>
            <table class="table table-sm" v-if="event">
              <thead>
                  <th>Carriers</th>
                  <th class="text-right">Before</th>
                  <th class="text-right">Lost</th>
                  <th class="text-right">After</th>
              </thead>
              <tbody>
                <tr>
                    <td><i>Weapons {{event.data.combatResult.weapons.attacker}} <span v-if="event.data.combatResult.weapons.attackerBase !== event.data.combatResult.weapons.attacker">(base {{event.data.combatResult.weapons.attackerBase}})</span></i></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr v-for="carrier of attackerCarriers" :key="carrier._id">
                    <td>
                        <i class="fas fa-rocket mr-2"></i>
                        <span :style="{ 'color': getCarrierColour(carrier) }" class="name-and-icon">
                          <player-icon-shape :filled="true" :shape="getCarrierShape(carrier)" :iconColour="getCarrierColour(carrier)" />
                          {{carrier.name}}
                        </span>
                        <span v-if="carrier.specialist" :title="carrier.specialist.description"> ({{carrier.specialist.name}})</span>
                    </td>
                    <td class="text-right">{{carrier.before}}</td>
                    <td class="text-right">{{carrier.lost}}</td>
                    <td class="text-right">{{carrier.after}}</td>
                </tr>
                <tr>
                  <td><strong>Totals</strong></td>
                  <td class="text-right"><strong>{{totalAttackerBefore}}</strong></td>
                  <td class="text-right"><strong>{{totalAttackerLost}}</strong></td>
                  <td class="text-right"><strong>{{totalAttackerAfter}}</strong></td>
                </tr>
              </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import PlayerIconShape from '../../player/PlayerIconShape.vue'

export default {
  components: {
    PlayerIconShape
  },
  props: {
    event: Object
  },
  data () {
    return {
      defenders: [],
      attackers: [],
      defenderCarriers: [],
      attackerCarriers: []
    }
  },
  mounted () {
    this.defenders = this.event.data.playerIdDefenders.map(id => GameHelper.getPlayerById(this.$store.state.game, id))
    this.attackers = this.event.data.playerIdAttackers.map(id => GameHelper.getPlayerById(this.$store.state.game, id))

    this.defenderCarriers = this.event.data.combatResult.carriers.filter(c => this.defenders.find(d => d._id === c.ownedByPlayerId) != null)
    this.attackerCarriers = this.event.data.combatResult.carriers.filter(c => this.attackers.find(a => a._id === c.ownedByPlayerId) != null)
  },
  methods: {
    getCarrierColour (carrier) {
      return GameHelper.getPlayerColour(this.$store.state.game, carrier.ownedByPlayerId)
    },
    getCarrierShape (carrier) {
      return GameHelper.getPlayerById(this.$store.state.game, carrier.ownedByPlayerId).shape;
    },
  },
  computed: {
    totalDefenderBefore: function () {
      return this.defenderCarriers.reduce((sum, c) => sum + c.before | 0, 0)
    },
    totalDefenderLost: function () {
      return this.defenderCarriers.reduce((sum, c) => sum + c.lost | 0, 0)
    },
    totalDefenderAfter: function () {
      return this.defenderCarriers.reduce((sum, c) => sum + c.after | 0, 0)
    },
    totalAttackerBefore: function () {
      return this.attackerCarriers.reduce((sum, c) => sum + c.before | 0, 0)
    },
    totalAttackerLost: function () {
      return this.attackerCarriers.reduce((sum, c) => sum + c.lost | 0, 0)
    },
    totalAttackerAfter: function () {
      return this.attackerCarriers.reduce((sum, c) => sum + c.after | 0, 0)
    }
  }
}
</script>

<style scoped>
.name-and-icon {
  display: inline-flex;
  align-items: center;
}

.name-and-icon svg {
  width: 12px;
  height: 12px;
  margin-right: 10px;
}
</style>
