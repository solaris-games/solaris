<template>
<tr>
    <td><player-icon v-if="carrier.ownedByPlayerId" :playerId="carrier.ownedByPlayerId" /></td>
    <td><a href="javascript:;" @click="clickCarrier">{{carrier.name}}</a></td>
    <td><a href="javascript:;" @click="goToCarrier"><i class="far fa-eye"></i></a></td>
    <td><specialist-icon :type="'carrier'" :defaultIcon="'rocket'" :specialist="carrier.specialist" :hideDefaultIcon="true"></specialist-icon></td>
    <td class="text-end">{{carrier.ships == null ? '???' : carrier.ships}}</td>
    <td class="text-end" :class="{'text-warning':carrier.waypointsLooped}" :title="carrier.waypointsLooped?'Looped':'Unlooped'">{{carrier.waypoints.length}}</td>
    <!-- <td><i class="fas fa-sync" v-if="carrier.waypointsLooped"></i></td> -->
    <td class="text-end">
      <span class="text-small" v-if="carrier.waypoints.length" :title="timeRemainingEtaActual">{{timeRemainingEta}}</span>
    </td>
    <td class="text-end text-muted">
      <span v-if="carrier.waypoints.length" class="text-small" :title="timeRemainingEtaTotalActual">{{timeRemainingEtaTotal}}</span>
    </td>
</tr>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import PlayerIconVue from '../player/PlayerIcon.vue'
import SpecialistIcon from '../specialist/SpecialistIcon.vue'
import {eventBusInjectionKey} from "../../../../eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";

export default {
  components: {
    'player-icon': PlayerIconVue,
    'specialist-icon': SpecialistIcon
  },
  props: {
    carrier: Object
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  data () {
    return {
      timeRemainingEta: null,
      timeRemainingEtaTotal: null,
      timeRemainingEtaActual: null,
      timeRemainingEtaTotalActual: null,
      intervalFunction: null
    }
  },
  mounted () {
    this.recalculateTimeRemaining()

    if (GameHelper.isGameInProgress(this.$store.state.game) || GameHelper.isGamePendingStart(this.$store.state.game)) {
      this.intervalFunction = setInterval(this.recalculateTimeRemaining, 250)
      this.recalculateTimeRemaining()
    }
  },
  methods: {
    clickCarrier (e) {
      this.$emit('onOpenCarrierDetailRequested', this.carrier._id)
    },
    goToCarrier (e) {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: this.carrier });
    },
    recalculateTimeRemaining () {
      this.timeRemainingEta = GameHelper.getCountdownTimeStringByTicks(this.$store.state.game, this.carrier.ticksEta, false, true)
      this.timeRemainingEtaActual = GameHelper.getCountdownTimeStringByTicks(this.$store.state.game, this.carrier.ticksEta, false, false)
      this.timeRemainingEtaTotal = GameHelper.getCountdownTimeStringByTicks(this.$store.state.game, this.carrier.ticksEtaTotal, false, true)
      this.timeRemainingEtaTotalActual = GameHelper.getCountdownTimeStringByTicks(this.$store.state.game, this.carrier.ticksEtaTotal, false, false)
    }
  }
}
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}
</style>
