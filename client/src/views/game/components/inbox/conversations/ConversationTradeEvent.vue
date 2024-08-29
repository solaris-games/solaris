<template>
<div class="container bg-dark mb-1"
    v-if="event"
    :class="{'left-message': !isFromUserPlayer, 'right-message': isFromUserPlayer}">
    <div class="row mt-0" :style="{'background-color': fromPlayerColour }" style="height:6px;"></div>
    <div class="row mt-0 ">
      <div class="col"></div>
      <div class="col-auto">
        <p class="mt-0 mb-0">
          <small><em>{{dateText}}</em></small>
        </p>
      </div>
    </div>
    <div class="row mt-0 ">
      <div class="col mt-1">
        <p v-if="event.data.renown" class="mb-1">
            <em>Sent <span class="text-warning">{{event.data.renown}}</span> renown.</em>
        </p>
        <p v-if="event.data.credits" class="mb-1">
            <em>Sent <span class="text-warning">{{event.data.credits}}</span> credits.</em>
        </p>
        <p v-if="event.data.creditsSpecialists" class="mb-1">
            <em>Sent <span class="text-warning">{{event.data.creditsSpecialists}}</span> specialist token(s).</em>
        </p>
        <p v-if="event.data.technology" class="mb-1">
            <em>Sent <span class="text-warning">Level {{event.data.technology.level}} {{getTechnologyFriendlyName(event.data.technology.name)}}</span>.</em>
        </p>
        <p v-if="event.data.carrierShips" class="mb-1">
            <em>Sent <span class="text-warning">{{event.data.carrierShips}} ships</span>.</em>
        </p>
        <p v-if="event.type === 'playerDebtSettled'" class="mb-1">
          <em>Paid off <span class="text-warning">{{getFormattedDebtValue(event.data.amount)}}</span> of debt.</em>
        </p>
        <p v-if="event.type === 'playerDebtForgiven'" class="mb-1">
          <em>Forgave <span class="text-warning">{{getFormattedDebtValue(event.data.amount)}}</span> of debt.</em>
        </p>
        <p v-if="event.type === 'playerDiplomacyStatusChanged'" class="mb-1">
          <em><strong>Diplomatic status changed</strong>:</em>
          <br/><br/>
          <em>{{event.data.playerToAlias}}: <span :class="{
            'text-success':event.data.statusFrom==='allies',
            'text-info':event.data.statusFrom==='neutral',
            'text-danger':event.data.statusFrom==='enemies'}">{{event.data.statusFrom}}</span></em>
          <br/>
          <em>{{event.data.playerFromAlias}}: <span :class="{
            'text-success':event.data.statusTo==='allies',
            'text-info':event.data.statusTo==='neutral',
            'text-danger':event.data.statusTo==='enemies'}">{{event.data.statusTo}}</span></em>
          <br/><br/>
          <em>Actual status: <span :class="{
            'text-success':event.data.actualStatus==='allies',
            'text-info':event.data.actualStatus==='neutral',
            'text-danger':event.data.actualStatus==='enemies'}">{{event.data.actualStatus}}</span></em>
        </p>
      </div>
    </div>
</div>
</template>

<script>
import GameHelper from '../../../../../services/gameHelper'
import TechnologyHelper from '../../../../../services/technologyHelper'

export default {
  components: {
  },
  props: {
    event: Object
  },
  methods: {
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    getTechnologyFriendlyName (key) {
      return TechnologyHelper.getFriendlyName(key)
    },
    getDateString (date) {
      return GameHelper.getDateString(date)
    },
    getFromPlayer () {
      switch (this.event.type) {
        case 'playerCreditsReceived':
        case 'playerCreditsSpecialistsReceived':
        case 'playerRenownReceived':
        case 'playerTechnologyReceived':
        case 'playerGiftReceived':
          return GameHelper.getPlayerById(this.$store.state.game, this.event.data.fromPlayerId)
        case 'playerCreditsSent':
        case 'playerCreditsSpecialistsSent':
        case 'playerRenownSent':
        case 'playerTechnologySent':
        case 'playerGiftSent':
          return GameHelper.getPlayerById(this.$store.state.game, this.event.playerId)
        case 'playerDebtSettled':
          return GameHelper.getPlayerById(this.$store.state.game, this.event.data.debtorPlayerId)
        case 'playerDebtForgiven':
          return GameHelper.getPlayerById(this.$store.state.game, this.event.data.creditorPlayerId)
        case 'playerDiplomacyStatusChanged':
          return GameHelper.getPlayerById(this.$store.state.game, this.event.data.playerIdFrom)
      }
    },
    getFormattedDebtValue(withText = false) {
      if (this.event.data.ledgerType === 'credits') {
        return `$${this.event.data.amount} credits`
      }

      return `${this.event.data.amount} specialist token(s)`
    }
  },
  computed: {
    isFromUserPlayer: function () {
      return this.getFromPlayer()._id === this.getUserPlayer()._id
    },
    dateText: function () {
      const date = GameHelper.getDateString(this.event.sentDate)
      let tick = ''
      if (this.event.sentTick || this.event.sentTick === 0) {
        tick = ` (tick ${this.event.sentTick})`
      }
      return date + tick
    },
    fromPlayerColour () {
      return this.$store.getters.getColourForPlayer(this.getFromPlayer()._id).value
    }
  }
}
</script>

<style scoped>
.left-message {
  width: 85%;
  margin-left:0;
}

.right-message {
  width: 85%;
  margin-right:0;
}
</style>
