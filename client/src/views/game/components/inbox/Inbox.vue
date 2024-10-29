<template>
<div class="menu-page">
  <div class="container">
      <menu-title title="Inbox" @onCloseRequested="onCloseRequested"/>
  </div>

  <conversation-list class="pt-2" />
</div>
</template>

<script>
import MenuTitle from '../MenuTitle.vue'
import ConversationListVue from './conversations/ConversationList.vue'
import ConversationApiService from '../../../../services/api/conversation'

export default {
  components: {
    'menu-title': MenuTitle,
    'conversation-list': ConversationListVue
  },
  data () {
    return {
      unreadMessages: 0
    }
  },
  created () {
    // TODO: This is duplicated on the menu header, is it possible to share this logic
    // to save API calls?
    this.$socket.subscribe('gameMessageSent', this.checkForUnreadMessages.bind(this))
    this.$socket.subscribe('gameConversationRead', this.checkForUnreadMessages.bind(this))
  },
  unmounted () {
    this.$socket.unsubscribe('gameMessageSent')
    this.$socket.unsubscribe('gameConversationRead')
  },
  async mounted () {
    await this.checkForUnreadMessages()
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
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
    }
  }
}
</script>

<style scoped>
</style>
