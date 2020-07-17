<template>
<div>
  <loading-spinner :loading="!events"/>

  <div class="container" v-if="events">
      <button class="btn btn-primary" @click="loadEvents">Refresh <i class="fas fa-sync"></i></button>
      <!-- <button class="btn btn-primary float-right">Mark All Read</button>
      <span class="ml-2">Click on an event to mark is as read.</span> -->
  </div>

  <div class="mt-2 events-container container" v-if="events">
      <events-list-item v-for="event in events" :key="event._id" :event="event" 
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
  </div>
</div>
</template>

<script>
import GameApiService from '../../../services/api/game'
import LoadingSpinnerVue from '../../../components/LoadingSpinner'
import EventsListItemVue from './EventsListItem'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'events-list-item': EventsListItemVue
  },
  data: function () {
    return {
      events: null
    }
  },
  mounted () {
    this.loadEvents()
  },
  methods: {
    async loadEvents () {
      this.events = null

      try {
        let response = await GameApiService.getEvents(this.$store.state.game._id)

        if (response.status === 200) {
          this.events = response.data
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
