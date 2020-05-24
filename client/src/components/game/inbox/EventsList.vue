<template>
<div>
  <loading-spinner :loading="!events"/>

  <div class="container">
      <button class="btn btn-primary" @click="loadEvents"><i class="fas fa-sync"></i></button>
      <!-- <button class="btn btn-primary float-right">Mark All Read</button>
      <span class="ml-2">Click on an event to mark is as read.</span> -->
  </div>

  <div class="mt-2 events-container" v-if="events">
      <events-list-item v-for="event in events" :key="event._id" :event="event" />
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
    }
  }
}
</script>

<style scoped>
.events-container {
  max-height: 400px;
  overflow: auto;
}
</style>
