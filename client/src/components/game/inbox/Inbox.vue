<template>
<div class="menu-page">
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
            <conversation-list 
              @onViewConversationRequested="onViewConversationRequested"
              @onCreateNewConversationRequested="onCreateNewConversationRequested"/>
        </div>
        <div class="tab-pane fade" id="events">
            <events-list
                @onOpenStarDetailRequested="onOpenStarDetailRequested"
                @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
                @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
        </div>
    </div>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import ConversationListVue from './conversations/ConversationList'
import EventsListVue from './events/EventsList'

export default {
  components: {
    'menu-title': MenuTitle,
    'conversation-list': ConversationListVue,
    'events-list': EventsListVue
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onViewConversationRequested (e) {
      this.$emit('onViewConversationRequested', e)
    },
    onViewConversationRequested (e) {
      this.$emit('onViewConversationRequested', e)
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
    onCreateNewConversationRequested (e) {
      this.$emit('onCreateNewConversationRequested', e)
    }
  }
}
</script>

<style scoped>
</style>
