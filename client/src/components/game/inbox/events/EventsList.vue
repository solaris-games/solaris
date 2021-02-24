<template>
<div>
  <loading-spinner :loading="!events"/>

  <div class="container" v-if="events">
    <div class="row">
      <div class="col">
        <button class="btn btn-sm btn-primary" @click="loadEvents">Refresh <i class="fas fa-sync"></i></button>
      </div>
      <div class="col">
        <select class="form-control form-control-sm" v-model="selectedFilter" @change="onSelectedFilterChanged">
          <option value="all">All Events</option>
          <option value="trade">Trade</option>
          <option value="combat">Combat</option>
        </select>
      </div>
    </div>
  </div>

  <!-- <button class="btn btn-primary float-right">Mark All Read</button>
  <span class="ml-2">Click on an event to mark is as read.</span> -->

  <div class="mt-2 events-container container" v-if="filteredEvents && filteredEvents.length">
      <events-list-item v-for="event in filteredEvents" :key="event._id" :event="event"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
  </div>

  <div class="text-center pt-3 pb-3" v-if="filteredEvents && !filteredEvents.length">
      No Events.
  </div>
</div>
</template>

<script>
import GameApiService from '../../../../services/api/game'
import LoadingSpinnerVue from '../../../../components/LoadingSpinner'
import EventsListItemVue from './EventsListItem'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'events-list-item': EventsListItemVue
  },
  data: function () {
    return {
      events: null,
      filteredEvents: null,
      selectedFilter: 'all'
    }
  },
  mounted () {
    this.loadEvents()
  },
  methods: {
    async loadEvents () {
      this.events = null

      let game = this.$store.state.game

      try {
        // 10 cycles ago
        let startTick = Math.max(0, game.state.tick - (game.settings.galaxy.productionTicks * 10))

        let response = await GameApiService.getEvents(this.$store.state.game._id, startTick)

        if (response.status === 200) {
          this.events = response.data

          this.onSelectedFilterChanged()
        }
      } catch (err) {
        console.error(err)
      }
    },
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', e)
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    },
    onOpenCarrierDetailRequested (e) {
      this.$emit('onOpenCarrierDetailRequested', e)
    },
    onSelectedFilterChanged (e) {
      const categories = {
        trade: [
          'playerTechnologyReceived',
          'playerTechnologySent',
          'playerCreditsReceived',
          'playerCreditsSent',
          'playerRenownReceived',
          'playerRenownSent',
          'playerDebtSettled',
          'playerDebtForgiven'
        ],
        combat: [
          'playerCombatStar',
          'playerCombatCarrier',
          'playerStarAbandoned',
          'playerStarCaptured'
        ]
      }

      if (this.selectedFilter === 'all') {
        this.filteredEvents = this.events
      } else {
        this.filteredEvents = this.events.filter(ev => {
          return categories[this.selectedFilter].indexOf(ev.type) > -1
        })
      }
    }
  }
}
</script>

<style scoped>
.events-container {
  max-height: 600px;
  overflow: auto;
}
</style>
