<template>
  <div class="d-none d-lg-block" v-if="isUserInGame">
    <div id="toggle" class="text-center" :class="{'bg-success has-read': !unreadMessages, 'bg-warning has-unread': unreadMessages}" @click="toggle" title="Inbox (M)">
      <span class="icon-text"><i class="fas fa-comments mr-1"></i>{{unreadMessages ? unreadMessages : ''}}</span>
    </div>

    <div id="window" class="bg-dark pt-2" v-if="isExpanded">
      <conversation-list v-if="menuState === MENU_STATES.INBOX"/>
      <create-conversation v-if="menuState == MENU_STATES.CREATE_CONVERSATION"
        :participantIds="menuArguments"
        @onCloseRequested="toggle"/>
      <conversation v-if="menuState == MENU_STATES.CONVERSATION"
        :conversationId="menuArguments"
        :key="menuArguments"
        @onCloseRequested="toggle"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
    </div>
  </div>
</template>

<script>
import eventBus from '../../../eventBus'
import MENU_STATES from '../../data/menuStates'
import KEYBOARD_SHORTCUTS from '../../data/keyboardShortcuts'
import GameHelper from '../../../services/gameHelper'
import ConversationListVue from '../inbox/conversations/ConversationList'
import ConversationCreateVue from './conversations/ConversationCreate.vue'
import ConversationDetailVue from './conversations/ConversationDetail.vue'

export default {
  components: {
    'conversation-list': ConversationListVue,
    'create-conversation': ConversationCreateVue,
    'conversation': ConversationDetailVue,
  },
  data () {
    return {
      MENU_STATES: MENU_STATES,
      isExpanded: false,
      menuState: null,
      menuArguments: null
    }
  },
  created () {
    document.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('resize', this.handleResize)

    this.sockets.subscribe('gameMessageSent', (data) => this.onMessageReceived(data))
  },
  mounted () {
    this.menuState = MENU_STATES.INBOX

    // TODO: These event names should be global constants
    eventBus.$on('onCreateNewConversationRequested', this.onCreateNewConversationRequested)
    eventBus.$on('onViewConversationRequested', this.onViewConversationRequested)
    eventBus.$on('onOpenInboxRequested', this.onOpenInboxRequested)
  },
  destroyed () {
    document.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('resize', this.handleResize)

    this.sockets.unsubscribe('gameMessageSent')
    
    eventBus.$off('onCreateNewConversationRequested', this.onCreateNewConversationRequested)
    eventBus.$off('onViewConversationRequested', this.onViewConversationRequested)
    eventBus.$off('onOpenInboxRequested', this.onOpenInboxRequested)
  },
  methods: {
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    },
    toggle () {
      this.isExpanded = !this.isExpanded;

      if (!this.isExpanded) {
        this.menuState = MENU_STATES.INBOX;
      }
    },
    onViewConversationRequested (e) {
      if (!this.canHandleConversationEvents()) {
        return
      }

      if (e.conversationId) {
        this.menuState = MENU_STATES.CONVERSATION
        this.menuArguments = e.conversationId
      } else if (e.participantIds) {
        this.menuState = MENU_STATES.CREATE_CONVERSATION
        this.menuArguments = e.participantIds
      }

      this.isExpanded = true
    },
    onOpenInboxRequested (e) {
      if (!this.canHandleConversationEvents()) {
        return
      }
      
      this.menuState = MENU_STATES.INBOX
      this.menuArguments = null

      this.isExpanded = true
    },
    onCreateNewConversationRequested (e) {
      if (!this.canHandleConversationEvents()) {
        return
      }
      
      this.menuState = MENU_STATES.CREATE_CONVERSATION
      this.menuArguments = e.participantIds || null

      this.isExpanded = true
    },
    onMessageReceived (e) {
      if (this.canHandleConversationEvents()) { // Don't do this if the window is too small as this component won't be displayed
        return
      }

      // TODO: Copied from Game.vue, any way to share this?
      let conversationId = e.conversationId

      // Show a toast only if the user isn't already in the conversation.
      if (this.menuState === MENU_STATES.CONVERSATION && this.menuArguments === conversationId) {
        return
      }

      let fromPlayer = GameHelper.getPlayerById(this.$store.state.game, e.fromPlayerId)

      this.$toasted.show(`New message from ${fromPlayer.alias}.`, {
        duration: null,
        type: 'info',
        duration: 10000,
        action: [
          {
            text: 'Dismiss',
            onClick: (e, toastObject) => {
              toastObject.goAway(0)
            }
          },
          {
            text: 'View',
            onClick: (e, toastObject) => {
              this.menuState = MENU_STATES.CONVERSATION
              this.menuArguments = conversationId
              this.isExpanded = true

              toastObject.goAway(0)
            }
          }
        ]
      })

      AudioService.join()
    },
    handleKeyDown (e) {
      // Note: We only care about the INBOX key here.
      if (/^(?:input|textarea|select|button)$/i.test(e.target.tagName)) return

      let key = e.key

      // Check for modifier keys and ignore the keypress if there is one.
      if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
        return
      }
      
      let isLoggedIn = this.$store.state.userId != null
      let isInGame = this.isUserInGame

      if (!isLoggedIn || !isInGame) {
        return
      }

      let menuState = KEYBOARD_SHORTCUTS.player[key]

      if (!menuState) {
        return
      }

      // Special case for Inbox shortcut, only do this if the screen is large
      if (menuState !== MENU_STATES.INBOX || this.canHandleConversationEvents()) {
        return
      }

      this.menuState = menuState
      this.menuArguments = null
      this.toggle()
    },
    handleResize (e) {
      if (!this.isExpanded) { // Don't care about this if it is already collapsed
        return
      }

      this.isExpanded = this.canHandleConversationEvents()
    },
    canHandleConversationEvents () {
      return window.innerWidth >= 992
    }
  },
  computed: {
    unreadMessages () {
      return this.$store.state.unreadMessages
    },
    isUserInGame () {
      return GameHelper.getUserPlayer(this.$store.state.game) != null
    }
  }
}
</script>

<style scoped>
#toggle {
  position: absolute;
  display: inline-table;
  right: 20px;
  bottom: 20px;
  height: 60px;
  width: 60px;
  border-radius: 50%;
  cursor: pointer;
}

#window {
  position: absolute;
  right: 20px;
  bottom: 100px;
  width: 473px;
  top: 60px;
  overflow: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}

.icon-text {
  display: table-cell;
  vertical-align: middle;
}

.has-unread {
  font-size: 20px;
}

.has-read {
  font-size: 30px;
}
</style>
