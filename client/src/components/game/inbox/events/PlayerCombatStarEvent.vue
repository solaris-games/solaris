<template>
    <div v-if="star">
        <p>
            Your forces have engaged the enemy in carrier-to-star combat at
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
                            <i class="fas fa-star mr-1"></i>
                            <span class="text-success" v-if="star">{{star.name}}</span>
                        </td>
                        <td class="text-right">{{event.data.combatResult.star.before}}</td>
                        <td class="text-right">{{event.data.combatResult.star.lost}}</td>
                        <td class="text-right">{{event.data.combatResult.star.after}}</td>
                    </tr>
                    <tr v-for="carrier of defenderCarriers" :key="carrier._id">
                        <td>
                            <i class="fas fa-rocket mr-1"></i>
                            <span class="text-success">{{getCarrierName(carrier._id)}}</span>
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
                            <i class="fas fa-rocket mr-1"></i>
                            <span class="text-danger">{{getCarrierName(carrier._id)}}</span>
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
    getCarrierName (carrierId) {
      return this.event.data.carriers.find(c => c._id === carrierId).name
    }
  }
}
</script>

<style scoped>
</style>
