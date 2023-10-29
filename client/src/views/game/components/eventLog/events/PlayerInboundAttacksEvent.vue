<template>
  <div>
    <p>
      Hostile carriers sighted en route to your stars
    </p>

    <span v-if="flattenedAttacks && carrierTimers">

      <table class="table table-sm">

        <thead class="table-dark">
          <th>Star</th>
          <th>Attacker</th>
          <th>Ships</th>
          <th class="text-end">ETA</th>
        </thead>

        <tbody>
          <tr v-for="attack of flattenedAttacks" :key="attack.carrier._id">
            <td>
              <star-label :starId="attack.star._id" :starName="getStarById(attack.star._id).name" />
            </td>
            <td>
              <a href="javascript:;" @click="onOpenPlayerDetailRequested(attack.carrier.ownedByPlayerId)">
                {{ getPlayerById(attack.carrier.ownedByPlayerId).alias }}
              </a>
            </td>
            <td>
              <a href="javascript:;" @click="onOpenCarrierDetailRequested(attack.carrier._id)">
                <specialist-icon :type="'carrier'" :defaultIcon="'rocket'"
                  :specialist="attack.carrier.specialist"></specialist-icon>
                {{ attack.carrier.ships }}
              </a>
            </td>
            <td class="text-end">
              {{ carrierTimers.find(c => c.id === attack.carrier._id).timeRemainingEta }}
            </td>
          </tr>

        </tbody>
      </table>
    </span>

  </div>
</template>

<script>

import GameHelper from '../../../../../services/gameHelper'
import StarLabelVue from '../../star/StarLabel'
import SpecialistIconVue from '../../specialist/SpecialistIcon.vue'

export default {
  components: {
    'star-label': StarLabelVue,
    'specialist-icon': SpecialistIconVue,
  },
  props: {
    event: Object
  },
  data() {
    return {
      flattenedAttacks: null,
      carrierTimers: null,
      intervalFunction: null,
    }
  },
  mounted() {

    this.flattenedAttacks = this.event.data.inboundAttacks.starsUnderAttack
      .flatMap(item => item.attackers.map(attacker => {
        return {
          carrier: attacker,
          star: item.star,
        }
      })).sort((a, b) => b.carrier.ships - a.carrier.ships);

    const flattenedCarrierIds = this.flattenedAttacks.map(a => a.carrier._id)

    this.carrierTimers = flattenedCarrierIds.map(id => {
      let c = GameHelper.getCarrierById(this.$store.state.game, id)

      return {
        id: id,
        carrier: c,
        timeRemainingEta: ''
      }
    })

    this.recalculateTimeRemaining()

    if (GameHelper.isGameInProgress(this.$store.state.game) || GameHelper.isGamePendingStart(this.$store.state.game)) {
      this.intervalFunction = setInterval(this.recalculateTimeRemaining, 500)
      this.recalculateTimeRemaining()
    }
  },
  destroyed() {
    clearInterval(this.intervalFunction)
  },
  methods: {
    getPlayerById(playerId) {
      return GameHelper.getPlayerById(this.$store.state.game, playerId)
    },
    getStarById(starId) {
      return GameHelper.getStarById(this.$store.state.game, starId)
    },
    recalculateTimeRemaining() {
      for (let timerData of this.carrierTimers) {
        let carrier = timerData.carrier
        if (!carrier) return
        if (carrier.ticksEta) {
          let timeString = GameHelper.getCountdownTimeStringByTicks(this.$store.state.game, carrier.ticksEta)
          timerData.timeRemainingEta = timeString
        }

      }
    },
    onOpenPlayerDetailRequested(e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    },
    onOpenCarrierDetailRequested(e) {
      this.$emit('onOpenCarrierDetailRequested', e)
    },
  }
}
</script>

<style scoped></style>
