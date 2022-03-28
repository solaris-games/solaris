<template>
    <div>
        <p>
            Your forces have engaged the enemy in <span class="text-warning">carrier-to-star</span> combat at <star-label :starId="event.data.starId" :starName="event.data.starName"/>.
        </p>
        <div class="table-responsive mt-2">
            <table class="table table-sm" v-if="event">
                <thead>
                    <th>Defender</th>
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
                    <tr>
                        <td>
                            <i class="fas fa-star mr-2"></i>
                            <span :style="{ 'color': getStarColour() }" class="name-and-icon">
                              <player-icon-shape :filled="true" :shape="getStarShape()" :iconColour="getStarColour()" />
                              {{event.data.starName}}
                            </span>
                            <span v-if="event.data.combatResult.star.specialist" :title="event.data.combatResult.star.specialist.description"> ({{event.data.combatResult.star.specialist.name}})</span>
                        </td>
                        <td class="text-right">{{event.data.combatResult.star.before}}</td>
                        <td class="text-right">{{event.data.combatResult.star.lost}}</td>
                        <td class="text-right">{{event.data.combatResult.star.after}}</td>
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
                    <th>Attacker(s)</th>
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
                            <player-icon-shape :filled="true" :iconColour="getCarrierColour(carrier)" :shape="getCarrierShape(carrier)" />
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
        
        <hr class="mt-0"/>

        <div v-if="event.data.captureResult">
          <p>
            The star <star-label :starId="event.data.starId" :starName="event.data.starName"/> has been captured
            by <a href="javascript:;" @click="onOpenPlayerDetailRequested(event.data.captureResult.capturedById)">{{event.data.captureResult.capturedByAlias}}</a>.
          </p>
          <p v-if="event.data.captureResult.captureReward">
            <a href="javascript:;" @click="onOpenPlayerDetailRequested(event.data.captureResult.capturedById)">{{event.data.captureResult.capturedByAlias}}</a> is awarded
            <span class="text-warning">${{event.data.captureResult.captureReward}}</span> credits for destroying economic infrastructure.
          </p>
        </div>
    </div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import PlayerIconShape from '../../player/PlayerIconShape.vue'
import StarLabelVue from '../../star/StarLabel'

export default {
  components: {
    PlayerIconShape,
    'star-label': StarLabelVue
  },
  props: {
    event: Object
  },
  data () {
    return {
      owner: null,
      defenders: null,
      attackers: [],
      defenderCarriers: [],
      attackerCarriers: []
    }
  },
  mounted () {
    this.owner = GameHelper.getPlayerById(this.$store.state.game, this.event.data.playerIdOwner)
    this.defenders = this.event.data.playerIdDefenders.map(id => GameHelper.getPlayerById(this.$store.state.game, id))
    this.attackers = this.event.data.playerIdAttackers.map(id => GameHelper.getPlayerById(this.$store.state.game, id))

    this.defenderCarriers = this.event.data.combatResult.carriers.filter(c => this.defenders.find(d => d._id === c.ownedByPlayerId) != null)
    this.attackerCarriers = this.event.data.combatResult.carriers.filter(c => this.attackers.find(a => a._id === c.ownedByPlayerId) != null)
  },
  methods: {
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    },
    getCarrierColour (carrier) {
      return GameHelper.getPlayerColour(this.$store.state.game, carrier.ownedByPlayerId)
    },
    getCarrierShape (carrier) {
      return GameHelper.getPlayerById(this.$store.state.game, carrier.ownedByPlayerId).shape;
    },
    getStarColour () {
      return GameHelper.getPlayerColour(this.$store.state.game, this.event.data.playerIdOwner)
    },
    getStarShape () {
      return GameHelper.getPlayerById(this.$store.state.game, this.event.data.playerIdOwner).shape;
    }
  },
  computed: {
    totalDefenderBefore: function () {
      return GameHelper.calculateCombatEventShipCount(this.event.data.combatResult.star, this.defenderCarriers, "before")
    },
    totalDefenderLost: function () {
      return GameHelper.calculateCombatEventShipCount(this.event.data.combatResult.star, this.defenderCarriers, "lost")
    },
    totalDefenderAfter: function () {
      return GameHelper.calculateCombatEventShipCount(this.event.data.combatResult.star, this.defenderCarriers, "after")
    },
    totalAttackerBefore: function () {
      return GameHelper.calculateCombatEventShipCount(null, this.attackerCarriers, "before")
    },
    totalAttackerLost: function () {
      return GameHelper.calculateCombatEventShipCount(null, this.attackerCarriers, "lost")
    },
    totalAttackerAfter: function () {
      return GameHelper.calculateCombatEventShipCount(null, this.attackerCarriers, "after")
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
