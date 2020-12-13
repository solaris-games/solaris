<template>
<div class="menu-page">
    <div class="container">
        <menu-title title="Inbox" @onCloseRequested="onCloseRequested"/>

        <ul class="nav nav-tabs">
            <li class="nav-item">
                <a class="nav-link active" data-toggle="tab" href="#diplomacy">Private</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#conversations">Groups</a>
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
        <div class="tab-pane fade show" id="conversations">
            <conversation-list 
              @onConversationOpenRequested="onConversationOpenRequested"
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
import DiplomacyListVue from './DiplomacyList'
import ConversationListVue from './conversations/ConversationList'
import EventsListVue from './EventsList'

export default {
  components: {
    'menu-title': MenuTitle,
    'diplomacy-list': DiplomacyListVue,
    'conversation-list': ConversationListVue,
    'events-list': EventsListVue
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onConversationOpenRequested (e) {
      this.$emit('onConversationOpenRequested', e)
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
