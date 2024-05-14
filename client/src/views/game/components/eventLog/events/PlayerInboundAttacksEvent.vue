<template>
  <div>
    <p>
      Hostile carriers sighted en route to your stars
    </p>

    <span v-if="carrierTimers">

      <table class="table table-sm">

        <thead class="table-dark">
          <th>Star</th>
          <th>Attacker</th>
          <th>Ships</th>
          <th class="text-end">ETA</th>
        </thead>

        <tbody>
          <tr v-for="attack of sortedAttacks" :key="attack.carrierId">
            <td>
              <star-label :starId="attack.starId" :starName="getStarById(attack.starId).name" />
            </td>
            <td>
              <a href="javascript:;" @click="onOpenPlayerDetailRequested(attack.attackingPlayerId)">
                <span class="player-icon">
                  <player-icon-shape :filled="true" :iconColour="getPlayerColor(attack.attackingPlayerId)"
                    :shape="getPlayerShape(attack.attackingPlayerId)" />
                </span>{{ getPlayerById(attack.attackingPlayerId).alias }}
              </a>
            </td>
            <td>
              <specialist-icon :type="'carrier'" :defaultIcon="'rocket'"
                :specialist="attack.specialist"></specialist-icon>
              <a href="javascript:;" @click="onOpenCarrierDetailRequested(attack.carrierId)">{{ attack.ships ?
                attack.ships : "???" }}
              </a>
            </td>
            <td class="text-end">
              <span v-if="carrierTimers.some(t => t.carrier._id === attack.carrierId)">
                {{ carrierTimers.find(t => t.carrier._id === attack.carrierId).timeRemainingEta }}
              </span>
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
import PlayerIconShape from '../../player/PlayerIconShape.vue'


export default {
  components: {
    PlayerIconShape,
    'star-label': StarLabelVue,
    'specialist-icon': SpecialistIconVue,
  },
  props: {
    event: Object
  },
  data() {
    return {
      sortedAttacks: null,
      carrierTimers: null,
      intervalFunction: null,
    }
  },
  mounted() {

    this.carrierTimers = this.event.data.attacks.map(attack => {
      let c = GameHelper.getCarrierById(this.$store.state.game, attack.carrierId)
      if (!c) return null

      return {
        carrier: c,
        timeRemainingEta: '',
      }
    }).filter(t => t)

    this.recalculateTimeRemaining()

    this.sortedAttacks = this.event.data.attacks.sort((a, b) => {
      // First, compare by time in ascending order

      let aTicks = this.getCarrierTicksEtaFromTimers(a.carrierId)
      let bTicks = this.getCarrierTicksEtaFromTimers(b.carrierId)

      if (aTicks && bTicks) {
        if (aTicks < bTicks) {
          return -1;
        } else if (aTicks > bTicks) {
          return 1;
        }
      }

      // If ticksEta values are equal, sort by ships in descending order
      if (a.ships === null && b.ships !== null) {
        return -1;
      } else if (a.ships !== null && b.ships === null) {
        return 1;
      } else if (a.ships > b.ships) {
        return -1;
      } else if (a.ships < b.ships) {
        return 1;
      }

      // If both ticksEta and ships are equal, sort by has specialist
      if (!a.specialist && b.specialist) {
        return 1;
      } else if (a.specialist && !b.specialist) {
        return -1;
      }

      // If ticksEta, ships, and has specialist are equal, sort by something else
      return b.carrierId.toString().localeCompare(a.carrierId.toString())
    })


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
    getPlayerColor(playerId) {
      return GameHelper.getPlayerColour(this.$store.state.game, playerId)
    },
    getPlayerShape(playerId) {
      return GameHelper.getPlayerById(this.$store.state.game, playerId).shape;
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
    getCarrierTicksEtaFromTimers(carrierId) {
      // vue doesn't like question mark?, manually check each reference?
      if (!carrierId) return 0

      let timerEntry = this.carrierTimers.find(t => {
        if (t.carrier === undefined) return false
        return t.carrier._id === carrierId
      })
      if (!timerEntry) return 0

      let carrier = timerEntry.carrier
      if (!carrier) return 0

      let waypoints = carrier.waypoints
      if (!waypoints) return 0

      let nextWaypoint = waypoints[0]
      if (!nextWaypoint) return 0

      return nextWaypoint.ticksEta
    },
    onOpenPlayerDetailRequested(e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    },
    onOpenCarrierDetailRequested(e) {
      //check that the carrier is still visible, maybe show some error?
      if (GameHelper.getCarrierById(this.$store.state.game, e)) {
        this.$emit('onOpenCarrierDetailRequested', e)
      }
    },
  },
}
</script>

<style scoped>
.player-icon {
  display: inline-flex;
  align-items: center;
}

.player-icon svg {
  width: 12px;
  height: 12px;
  margin-right: 10px;
}
</style>
