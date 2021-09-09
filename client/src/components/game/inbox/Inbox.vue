<template>
<div class="menu-page">
    <div class="container">
        <menu-title title="Inbox" @onCloseRequested="onCloseRequested"/>

        <ul class="nav nav-tabs">
            <li class="nav-item">
                <a class="nav-link active" data-toggle="tab" href="#diplomacy">Diplomacy<span class="ml-1" v-if="unreadMessages">({{unreadMessages}})</span></a>
            </li>
            <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#events">Events<span class="ml-1" v-if="unreadEvents">({{unreadEvents}})</span></a>
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
            <events-list @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
        </div>
    </div>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import ConversationListVue from './conversations/ConversationList'
import EventsListVue from './events/EventsList'
import ConversationApiService from '../../../services/api/conversation'
import EventApiService from '../../../services/api/event'

export default {
  components: {
    'menu-title': MenuTitle,
    'conversation-list': ConversationListVue,
    'events-list': EventsListVue
  },
  data () {
    return {
      unreadMessages: 0,
      unreadEvents: 0
    }
  },
  created () {
    // TODO: This is duplicated on the menu header, is it possible to share this logic
    // to save API calls?
    this.sockets.subscribe('gameMessageSent', this.checkForUnreadMessages.bind(this))
    this.sockets.subscribe('gameConversationRead', this.checkForUnreadMessages.bind(this))
    this.sockets.subscribe('playerEventRead', this.checkForUnreadEvents.bind(this))
    this.sockets.subscribe('playerAllEventsRead', this.checkForUnreadEvents.bind(this))
  },
  destroyed () {
    this.sockets.unsubscribe('gameMessageSent')
    this.sockets.unsubscribe('gameConversationRead')
    this.sockets.unsubscribe('playerEventRead')
    this.sockets.unsubscribe('playerAllEventsRead')
  },
  async mounted () {
    await this.checkForUnreadMessages()
    await this.checkForUnreadEvents()
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
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    },
    onCreateNewConversationRequested (e) {
      this.$emit('onCreateNewConversationRequested', e)
    },
    async checkForUnreadMessages () {
      try {
        let response = await ConversationApiService.getUnreadCount(this.$store.state.game._id)

        if (response.status === 200) {
          this.unreadMessages = response.data.unread
        }
      } catch (err) {
        console.error(err)
      }
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
