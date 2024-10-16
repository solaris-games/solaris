<template>
  <div class="d-none d-lg-block" v-if="isUserInGame && !isTutorialGame">
    <div id="toggle" class="text-center" :class="{'bg-success has-read': !unreadMessages, 'bg-warning has-unread pulse': unreadMessages}" @click="toggle" title="Inbox (M)">
      <span class="icon-text"><i class="fas fa-comments me-1"></i>{{unreadMessages ? unreadMessages : ''}}</span>
    </div>

    <div id="window" v-if="isExpanded" class="header-bar-bg">
      <conversation-list v-if="menuState === MENU_STATES.INBOX"/>
      <create-conversation v-if="menuState == MENU_STATES.CREATE_CONVERSATION"
        :participantIds="menuArguments"
        @onCloseRequested="toggle"/>
      <conversation v-if="menuState == MENU_STATES.CONVERSATION"
        :conversationId="menuArguments"
        :key="menuArguments"
        @onCloseRequested="toggle"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onOpenReportPlayerRequested="onOpenReportPlayerRequested" />
    </div>
  </div>
</template>

<script>
import eventBus from '../../../../eventBus'
import MENU_STATES from '../../../../services/data/menuStates'
import KEYBOARD_SHORTCUTS from '../../../../services/data/keyboardShortcuts'
import GameHelper from '../../../../services/gameHelper'
import ConversationListVue from '../inbox/conversations/ConversationList.vue'
import ConversationCreateVue from './conversations/ConversationCreate.vue'
import ConversationDetailVue from './conversations/ConversationDetail.vue'
import AudioService from '../../../../game/audio'

export default {
  components: {
    'conversation-list': ConversationListVue,
    'create-conversation': ConversationCreateVue,
    'conversation': ConversationDetailVue,
  },
  data () {
    return {
      MENU_STATES: MENU_STATES,
      isExpanded: false
    }
  },
  created () {
    document.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('resize', this.handleResize)

    this.$socket.subscribe('gameMessageSent', (data) => this.onMessageReceived(data))
  },
  mounted () {
    this.$store.commit('setMenuStateChat', {
      state: MENU_STATES.INBOX,
      args: null
    })

    // TODO: These event names should be global constants
    eventBus.$on('onMenuChatSidebarRequested', this.toggle)
    eventBus.$on('onCreateNewConversationRequested', this.onCreateNewConversationRequested)
    eventBus.$on('onViewConversationRequested', this.onViewConversationRequested)
    eventBus.$on('onOpenInboxRequested', this.onOpenInboxRequested)
  },
  unmounted () {
    document.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('resize', this.handleResize)

    this.$socket.unsubscribe('gameMessageSent')

    eventBus.$off('onMenuChatSidebarRequested', this.toggle)
    eventBus.$off('onCreateNewConversationRequested', this.onCreateNewConversationRequested)
    eventBus.$off('onViewConversationRequested', this.onViewConversationRequested)
    eventBus.$off('onOpenInboxRequested', this.onOpenInboxRequested)
  },
  methods: {
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    },
    onOpenReportPlayerRequested (e) {
      this.$emit('onOpenReportPlayerRequested', e)
    },
    toggle () {
      this.isExpanded = !this.isExpanded;

      this.$store.commit('setMenuStateChat', {
        state: MENU_STATES.INBOX,
        args: null
      })
    },
    onViewConversationRequested (e) {
      if (!this.canHandleConversationEvents()) {
        return
      }

      if (e.conversationId) {
        this.$store.commit('setMenuStateChat', {
          state: MENU_STATES.CONVERSATION,
          args: e.conversationId
        })
      } else if (e.participantIds) {
        this.$store.commit('setMenuStateChat', {
          state: MENU_STATES.CREATE_CONVERSATION,
          args: e.participantIds
        })
      }

      this.isExpanded = true
    },
    onOpenInboxRequested (e) {
      if (!this.canHandleConversationEvents()) {
        return
      }

      this.$store.commit('setMenuStateChat', {
        state: MENU_STATES.INBOX,
        args: null
      })

      this.isExpanded = true
    },
    onCreateNewConversationRequested (e) {
      if (!this.canHandleConversationEvents()) {
        return
      }

      this.$store.commit('setMenuStateChat', {
        state: MENU_STATES.CREATE_CONVERSATION,
        args: e.participantIds || null
      })

      this.isExpanded = true
    },
    onMessageReceived (e) {
      if (!this.canHandleConversationEvents()) { // Don't do this if the window is too small as this component won't be displayed
        return
      }

      // TODO: Copied from Game.vue, any way to share this?
      let conversationId = e.conversationId

      // Show a toast only if the user isn't already in the conversation.
      if (this.menuState === MENU_STATES.CONVERSATION && this.menuArguments === conversationId) {
        return
      }

      let fromPlayer = GameHelper.getPlayerById(this.$store.state.game, e.fromPlayerId)

      this.$toast.info(`New message from ${fromPlayer.alias}.`, {
        duration: 10000,
        onClick: () => {
          this.$store.commit('setMenuStateChat', {
            state: MENU_STATES.CONVERSATION,
            args: conversationId
          })

          this.isExpanded = true
        }
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

      let menuState = KEYBOARD_SHORTCUTS.all[key]

      if (menuState === null && this.isExpanded) {
        return this.toggle()
      }

      menuState = KEYBOARD_SHORTCUTS.player[key]

      if (!menuState) {
        return
      }

      // Special case for Inbox shortcut, only do this if the screen is large
      if (menuState !== MENU_STATES.INBOX || !this.canHandleConversationEvents()) {
        return
      }

      this.$store.commit('setMenuStateChat', {
        state: menuState,
        args: null
      })

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
    menuState () {
      return this.$store.state.menuStateChat
    },
    menuArguments () {
      return this.$store.state.menuArgumentsChat
    },
    unreadMessages () {
      return this.$store.state.unreadMessages
    },
    isUserInGame () {
      return GameHelper.getUserPlayer(this.$store.state.game) != null
    },
    isTutorialGame () {
      return GameHelper.isTutorialGame(this.$store.state.game)
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
  z-index: 1;
}

#window {
  position: absolute;
  right: 0px;
  bottom: 100px;
  width: 473px;
  top: 45px;
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

.pulse {
  animation: blinker 1.5s linear infinite;
}

@keyframes blinker {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
    transform: scale(1.1)
  }
  100% {
    opacity: 0.5;
  }
}
</style>
