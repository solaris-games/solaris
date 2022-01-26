<template>
<div class="container bg-secondary mb-1"
    v-if="event"
    :class="{'left-message': !isFromUserPlayer, 'right-message': isFromUserPlayer}">
    <div class="row mt-0" :style="{'background-color': getFromPlayerColour()}" style="height:6px;"></div>
    <div class="row mt-0 bg-secondary">
      <div class="col"></div>
      <div class="col-auto">
        <p class="mt-0 mb-0">
          <small><em>{{getDateString(event.sentDate)}}</em></small>
        </p>
      </div>
    </div>
    <div class="row mt-0 bg-secondary">
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
      </div>
    </div>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import TechnologyHelper from '../../../../services/technologyHelper'

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
      }
    },
    getFromPlayerColour () {
      return GameHelper.getPlayerColour(this.$store.state.game, this.getFromPlayer()._id)
    }
  },
  computed: {
    isFromUserPlayer: function () {
      return this.getFromPlayer()._id === this.getUserPlayer()._id
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
