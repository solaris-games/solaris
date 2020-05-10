<template>
<div>
    <div class="container">
        <menu-title title="Inbox" @onCloseRequested="onCloseRequested"/>

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
            <diplomacy-list @onConversationOpenRequested="onConversationOpenRequested"/>
        </div>
        <div class="tab-pane fade" id="events">
            <events-list/>
        </div>
    </div>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import DiplomacyListVue from './DiplomacyList'
import EventsListVue from './EventsList'

export default {
  components: {
    'menu-title': MenuTitle,
    'diplomacy-list': DiplomacyListVue,
    'events-list': EventsListVue
  },
  methods: {
    onCloseRequested (e) {
        this.$emit('onCloseRequested', e)
    },
    onConversationOpenRequested (e) {
      this.$emit('onConversationOpenRequested', e)
    }
  }
}
</script>

<style scoped>
</style>
