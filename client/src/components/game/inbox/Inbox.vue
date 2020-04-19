<template>
<div>
    <div class="container">
        <h3 class="pt-2">Inbox</h3>

        <ul class="nav nav-tabs">
            <li class="nav-item">
                <a class="nav-link active" data-toggle="tab" href="#diplomacy">Diplomacy</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#events">Events</a>
            </li>
        </ul>
    </div>

    <div class="tab-content pt-2">
        <div class="tab-pane fade show active" id="diplomacy">
            <diplomacy-list :game="game" @onConversationOpenRequested="onConversationOpenRequested"/>
        </div>
        <div class="tab-pane fade" id="events">
            <events-list :game="game"/>
        </div>
    </div>
</div>
</template>

<script>
import DiplomacyListVue from './DiplomacyList'
import EventsListVue from './EventsList'

export default {
  components: {
    'diplomacy-list': DiplomacyListVue,
    'events-list': EventsListVue
  },
  props: {
    game: Object
  },
  methods: {
    onConversationOpenRequested (e) {
      this.$emit('onConversationOpenRequested', e)
    }
  }
}
</script>

<style scoped>
</style>
