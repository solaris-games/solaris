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
import { eventBusInjectionKey } from '../../../../eventBus'
import MENU_STATES from '../../../../services/data/menuStates'
import KEYBOARD_SHORTCUTS from '../../../../services/data/keyboardShortcuts'
import GameHelper from '../../../../services/gameHelper'
import ConversationListVue from '../inbox/conversations/ConversationList.vue'
import ConversationCreateVue from './conversations/ConversationCreate.vue'
import ConversationDetailVue from './conversations/ConversationDetail.vue'
import { inject } from 'vue'
import MenuEventBusEventNames from '../../../../eventBusEventNames/menu'

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
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  created () {
    document.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('resize', this.handleResize)
  },
  mounted () {
    this.$store.commit('setMenuStateChat', {
      state: MENU_STATES.INBOX,
      args: null
    })

    this.eventBus.on(MenuEventBusEventNames.OnMenuChatSidebarRequested, this.toggle);
    this.eventBus.on(MenuEventBusEventNames.OnCreateNewConversationRequested, this.onCreateNewConversationRequested);
    this.eventBus.on(MenuEventBusEventNames.OnViewConversationRequested, this.onViewConversationRequested);
    this.eventBus.on(MenuEventBusEventNames.OnOpenInboxRequested, this.onOpenInboxRequested);
  },
  unmounted () {
    document.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('resize', this.handleResize)

    this.eventBus.off(MenuEventBusEventNames.OnMenuChatSidebarRequested, this.toggle);
    this.eventBus.off(MenuEventBusEventNames.OnCreateNewConversationRequested, this.onCreateNewConversationRequested);
    this.eventBus.off(MenuEventBusEventNames.OnViewConversationRequested, this.onViewConversationRequested);
    this.eventBus.off(MenuEventBusEventNames.OnOpenInboxRequested, this.onOpenInboxRequested);
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
