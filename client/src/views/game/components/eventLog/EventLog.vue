<template>
<div class="menu-page">
  <div class="container">
    <menu-title title="Event Log" @onCloseRequested="onCloseRequested"/>
  </div>

  <events-list class="pt-2" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle.vue'
import EventsListVue from './events/EventsList.vue'
import EventApiService from '../../../../services/api/event'

export default {
  components: {
    'menu-title': MenuTitle,
    'events-list': EventsListVue
  },
  data () {
    return {
      unreadEvents: 0
    }
  },
  created () {
    this.$socket.subscribe('playerEventRead', this.checkForUnreadEvents.bind(this))
    this.$socket.subscribe('playerAllEventsRead', this.checkForUnreadEvents.bind(this))
  },
  unmounted () {
    this.$socket.unsubscribe('playerEventRead')
    this.$socket.unsubscribe('playerAllEventsRead')
  },
  async mounted () {
    await this.checkForUnreadEvents()
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    },
    async checkForUnreadEvents () {
      try {
        let response = await EventApiService.getUnreadCount(this.$store.state.game._id)

        if (response.status === 200) {
          this.unreadEvents = response.data.unread
        }
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

<style scoped>
</style>
