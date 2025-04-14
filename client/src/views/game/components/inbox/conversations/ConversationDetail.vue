<template>
<div class="menu-page">
  <loading-spinner :loading="!conversation"/>

  <div class="container" v-if="conversation">
    <menu-title class="menu-page-header pb-1 bg-dark" @onCloseRequested="onCloseRequested">
      <button class="btn btn-sm" v-if="conversation.createdBy" :class="{'btn-outline-default':!pinnedOnly, 'btn-success':pinnedOnly}" title="Show/Hide pinned messages" @click="toggledPinnedOnly">
        <i class="fas fa-thumbtack"></i>
      </button>
      <button class="btn btn-sm ms-1" :class="{'btn-outline-success':!conversation.isMuted, 'btn-danger':conversation.isMuted}" title="Mute/Unmute conversation" @click="toggleMuteConversation">
        <i class="fas" :class="{'fa-bell-slash':conversation.isMuted,'fa-bell':!conversation.isMuted}"></i>
      </button>
      <button class="btn btn-sm btn-outline-info ms-1 d-lg-none" @click="toggleConversationWindow" title="Toggle conversation display">
        <i class="fas" :class="{'fa-eye-slash':!toggleDisplay,'fa-eye':toggleDisplay}"></i>
      </button>
      <button class="btn btn-sm btn-outline-primary ms-1" @click="onOpenInboxRequested" title="Back to Inbox"><i class="fas fa-inbox"></i></button>
      <button class="btn btn-sm btn-outline-warning ms-1" @click="leaveConversation" v-if="conversation.createdBy" title="Leave conversation"><i class="fas fa-sign-out-alt"></i></button>
    </menu-title>

    <h5 v-if="conversation && toggleDisplay" class="menu-page-header-padding mb-0">{{conversation.name}}</h5>

    <p v-if="!toggleDisplay" class="pb-0 mb-1 text-warning menu-page-header-padding">
      <small><i>Click the <i class="fas fa-eye-slash"></i> button to view the conversation.</i></small>
    </p>

    <conversation-participants v-if="toggleDisplay" :conversation="conversation" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>

    <div class="messages-container">
      <div class="pt-0 mb-2 mt-2" v-if="toggleDisplay && filteredMessages.length">
        <div v-for="message in filteredMessages" v-bind:key="message._id" class="mb-1">
          <conversation-message v-if="message.type === 'message'" :conversation="conversation" :message="message"
            @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
            @onOpenReportPlayerRequested="onOpenReportPlayerRequested"
            @onMinimizeConversationRequested="toggleConversationWindow"/>
          <conversation-trade-event v-if="message.type !== 'message'" :event="message"/>
        </div>
      </div>
    </div>

    <div class="pt-0 mb-2 mt-2" v-if="toggleDisplay && !filteredMessages.length">
        <p class="mb-0 text-center">No messages.</p>
    </div>

    <compose-conversation-message class="compose-message" v-if="toggleDisplay" :conversationId="conversationId" @onConversationMessageSent="onConversationMessageSent" />
  </div>
</div>
</template>

<script>
import GameHelper from '../../../../../services/gameHelper'
import ConversationApiService from '../../../../../services/api/conversation'
import LoadingSpinnerVue from '../../../../components/LoadingSpinner.vue'
import MenuTitle from '../../MenuTitle.vue'
import ConversationParticipantsVue from './ConversationParticipants.vue'
import ComposeMessageVue from './ConversationCompose.vue'
import ConversationMessageVue from './ConversationMessage.vue'
import ConversationTradeEventVue from './ConversationTradeEvent.vue'
import { inject } from 'vue'
import { eventBusInjectionKey } from '../../../../../eventBus'
import PlayerEventBusEventNames from '../../../../../eventBusEventNames/player'
import MenuEventBusEventNames from '../../../../../eventBusEventNames/menu'
import UserEventBusEventNames from "../../../../../eventBusEventNames/user";

export default {
  components: {
    'menu-title': MenuTitle,
    'loading-spinner': LoadingSpinnerVue,
    'conversation-participants': ConversationParticipantsVue,
    'compose-conversation-message': ComposeMessageVue,
    'conversation-message': ConversationMessageVue,
    'conversation-trade-event': ConversationTradeEventVue
  },
  props: {
    conversationId: String,
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  data () {
    return {
      conversation: null,
      userPlayer: null,
      toggleDisplay: true,
      pinnedOnly: false
    }
  },
  async mounted () {
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game);
    await this.loadConversation();

    this.eventBus.on(UserEventBusEventNames.GameMessageSent, this.onMessageReceived);
    this.eventBus.on(PlayerEventBusEventNames.GameConversationRead, this.onConversationRead);
    this.eventBus.on(PlayerEventBusEventNames.GameConversationLeft, this.onConversationLeft);
    this.eventBus.on(PlayerEventBusEventNames.GameConversationMessagePinned, this.onConversationMessagePinned);
    this.eventBus.on(PlayerEventBusEventNames.GameConversationMessageUnpinned, this.onConversationMessageUnpinned);
    this.eventBus.on(PlayerEventBusEventNames.PlayerCreditsReceived, this.onTradeEventReceived);
    this.eventBus.on(PlayerEventBusEventNames.PlayerCreditsSpecialistsReceived, this.onTradeEventReceived);
    this.eventBus.on(PlayerEventBusEventNames.PlayerRenownReceived, this.onTradeEventReceived);
    this.eventBus.on(PlayerEventBusEventNames.PlayerTechnologyReceived, this.onTradeEventReceived);
  },
  unmounted () {
    this.eventBus.off(UserEventBusEventNames.GameMessageSent, this.onMessageReceived);
    this.eventBus.off(PlayerEventBusEventNames.GameConversationRead, this.onConversationRead);
    this.eventBus.off(PlayerEventBusEventNames.GameConversationLeft, this.onConversationLeft);
    this.eventBus.off(PlayerEventBusEventNames.GameConversationMessagePinned, this.onConversationMessagePinned);
    this.eventBus.off(PlayerEventBusEventNames.GameConversationMessageUnpinned, this.onConversationMessageUnpinned);
    this.eventBus.off(PlayerEventBusEventNames.PlayerCreditsReceived, this.onTradeEventReceived);
    this.eventBus.off(PlayerEventBusEventNames.PlayerCreditsSpecialistsReceived, this.onTradeEventReceived);
    this.eventBus.off(PlayerEventBusEventNames.PlayerRenownReceived, this.onTradeEventReceived);
    this.eventBus.off(PlayerEventBusEventNames.PlayerTechnologyReceived, this.onTradeEventReceived);

    this.$store.commit('resetMentions')
    this.$store.commit('closeConversation')
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onOpenInboxRequested (e) {
      this.eventBus.emit(MenuEventBusEventNames.OnOpenInboxRequested, e);
    },
    onOpenReportPlayerRequested (e) {
      this.$emit('onOpenReportPlayerRequested', e)
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    },
    toggleConversationWindow (e) {
      this.toggleDisplay = !this.toggleDisplay
    },
    onConversationMessageSent (e) {
      this.conversation.messages.push(e)

      this.scrollToEnd()
    },
    onMessageReceived (e) {
      if (e.conversationId === this.conversation._id) {
        this.conversation.messages.push(e)

        this.scrollToEnd()
      }
    },
    onConversationRead (e) {
      if (e.conversationId === this.conversation._id) {
        let messages = this.conversation.messages.filter(m => m.type === 'message')

        for (let message of messages) {
          if (message.readBy.indexOf(e.readByPlayerId) < 0) {
            message.readBy.push(e.readByPlayerId)
          }
        }
      }
    },
    onConversationLeft (e) {
      if (e.conversationId === this.conversation._id) {
        this.conversation.participants.splice(this.conversation.participants.indexOf(e.playerId), 1)
      }
    },
    onConversationMessagePinned (e) {
      if (e.conversationId === this.conversation._id) {
        let message = this.conversation.messages.find(m => m._id === e.messageId)

        if (message) {
          message.pinned = true
        }
      }
    },
    onConversationMessageUnpinned (e) {
      if (e.conversationId === this.conversation._id) {
        let message = this.conversation.messages.find(m => m._id === e.messageId)

        if (message) {
          message.pinned = false
        }
      }
    },
    onTradeEventReceived (e) {
      if (this.conversation.participants.length !== 2) {
        return
      }

      let partnerPlayerId = this.conversation.participants.filter(p => p !== this.userPlayer._id)[0]

      let isTradeEventBetweenPlayers = (e.playerId === this.userPlayer._id && e.data.fromPlayerId === partnerPlayerId) ||
        (e.playerId === partnerPlayerId && e.data.fromPlayerId === this.userPlayer._id) ||
        (e.playerId === this.userPlayer._id && e.data.toPlayerId === partnerPlayerId) ||
        (e.playerId === partnerPlayerId && e.data.toPlayerId === this.userPlayer._id)

      if (isTradeEventBetweenPlayers) {
        this.conversation.messages.push(e)

        this.scrollToEnd()
      }
    },
    scrollToEnd () {
      // This doesn't seem to work inline, have to wait 100ms so that the UI can update itself
      // before scrolling the div container to the bottom.
      setTimeout(async () => {
        if (this.conversation && this.conversation.messages.length) {
          if (window.innerWidth >= 992) {
            const el = this.$el.getElementsByClassName('compose-message')[0];

            if (el) {
              el.scrollIntoView()
            }
          } else {
            const el = this.$el.querySelector('.messages-container')
            el.scrollTop = el.scrollHeight
          }

          await this.markConversationAsRead()
        }
      }, 100)
    },
    toggledPinnedOnly () {
      this.pinnedOnly = !this.pinnedOnly
      this.scrollToEnd()
    },
    async loadConversation () {
      this.conversation = null

      try {
        let response = await ConversationApiService.detail(this.$store.state.game._id, this.conversationId)

        if (response.status === 200) {
          this.conversation = response.data
          this.$store.commit('openConversation', this.conversationId)

          this.scrollToEnd()
        }
      } catch (e) {
        console.error(e)
      }
    },
    async markConversationAsRead () {
      try {
        await ConversationApiService.markAsRead(this.$store.state.game._id, this.conversation._id)
      } catch (err) {
        console.error(err)
      }
    },
    async leaveConversation () {
      if (await this.$confirm('Leave conversation', `Are you sure you want to leave this conversation?`)) {
        try {
          await ConversationApiService.leave(this.$store.state.game._id, this.conversation._id)

          this.onOpenInboxRequested()
        } catch (err) {
          console.error(err)
        }
      }
    },
    async toggleMuteConversation () {
      try {
        if (this.conversation.isMuted) {
          this.conversation.isMuted = false
          await ConversationApiService.unmute(this.$store.state.game._id, this.conversation._id)
        } else {
          this.conversation.isMuted = true
          await ConversationApiService.mute(this.$store.state.game._id, this.conversation._id)
        }
      } catch (err) {
        console.error(err)
      }
    }
  },
  computed: {
    filteredMessages () {
      if (!this.pinnedOnly) {
        return this.conversation.messages
      } else {
        return this.conversation.messages.filter(m => m.pinned)
      }
    }
  }
}
</script>

<style scoped>
@media screen and (max-width: 992px) {
  .messages-container {
    max-height: 500px;
    overflow: auto;
  }
}
@media screen and (min-width: 992px) {
  .menu-page-header {
    position: fixed;
    z-index: 1;
    width: 456px;
  }

  .menu-page-header-padding {
    padding-top: 48px;
  }
}
</style>
