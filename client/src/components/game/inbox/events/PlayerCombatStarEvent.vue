<template>
    <div v-if="star">
        <p>
            Your forces have engaged the enemy in <span class="text-warning">carrier-to-star</span> combat at
            <a href="javascript:;" @click="onOpenStarDetailRequested">{{star.name}}</a>.
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
                        <td>Defender: Weapons {{event.data.combatResult.weapons.defender}}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>
                            <i class="fas fa-star mr-2"></i>
                            <span :style="{ 'color': getStarColour() }" v-if="star" class="name-and-icon">
                              <player-icon-shape :filled="true" :shape="getStarShape()" :iconColour="getStarColour()" />
                              {{star.name}}
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
                        <td>Attacker(s): Weapons {{event.data.combatResult.weapons.attacker}}</td>
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
      defender: null,
      attackers: [],
      star: null,
      defenderCarriers: [],
      attackerCarriers: []
    }
  },
  mounted () {
    this.defender = GameHelper.getPlayerById(this.$store.state.game, this.event.data.playerIdDefender)
    this.attackers = this.event.data.playerIdAttackers.map(id => GameHelper.getPlayerById(this.$store.state.game, id))
    this.star = GameHelper.getStarById(this.$store.state.game, this.event.data.starId)

    this.defenderCarriers = this.event.data.combatResult.carriers.filter(c => c.ownedByPlayerId === this.event.data.playerIdDefender)
    this.attackerCarriers = this.event.data.combatResult.carriers.filter(c => c.ownedByPlayerId !== this.event.data.playerIdDefender)
  },
  methods: {
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', this.star._id)
    },
    getCarrierColour (carrier) {
      return GameHelper.getPlayerColour(this.$store.state.game, carrier.ownedByPlayerId)
    },
    getCarrierShape (carrier) {
      return GameHelper.getPlayerById(this.$store.state.game, carrier.ownedByPlayerId).shape;
    },
    getStarColour (starId) {
      return GameHelper.getPlayerColour(this.$store.state.game, this.event.data.playerIdDefender)
    },
    getStarShape () {
      return GameHelper.getPlayerById(this.$store.state.game, this.event.data.playerIdDefender).shape;
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
