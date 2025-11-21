<template>
<div class="container pt-1"
  :class="{'bg-secondary': !isAllPlayersConversation, 'bg-primary': isAllPlayersConversation, 'bg-warning':conversation.unreadCount}"
    @click="openConversation">
    <div class="row pb-1">
        <div class="col">
          <span>
              <strong>{{conversation.name}}</strong>
          </span>
        </div>
        <div class="col-auto player-icons" v-if="!isAllPlayersConversation">
          <small v-for="participant in conversation.participants" :key="participant">
            <player-icon :playerId="participant"/>
          </small>
        </div>
        <div class="col-auto">
          <small v-if="conversation.isMuted" title="This conversation is muted" class="me-1">
            <i class="fas fa-bell-slash"></i>
          </small>
          <small v-if="!hasReadLastMessage && conversation.unreadCount">
            <i class="fas fa-envelope"></i>
            {{conversation.unreadCount}}
          </small>
          <small>
            <i class="fas fa-user"></i>
            {{conversation.participants.length}}
          </small>
        </div>
    </div>
    <!-- <div class="row mt-1" :style="{'background-color': colour}" style="height:6px;"></div> -->
    <div class="row bg-dark mt-0">
        <div class="col-12" v-if="hasLastMessage">
          <p class="mt-2 mb-2" :class="{'truncate':isTruncated}">
            <player-icon v-if="lastMessage.fromPlayerId" :playerId="lastMessageSender._id" />
            {{lastMessage}}
          </p>
        </div>
        <div class="col-12" v-if="hasLastMessage">
            <small class="float-end mb-2"><i>{{getDateString(conversation.lastMessage.sentDate)}}</i></small>
        </div>
        <div class="col-12" v-if="!hasLastMessage">
            <p class="mt-2 mb-2">No messages.</p>
        </div>
    </div>
</div>
</template>

<script>
import { eventBusInjectionKey } from '../../../../../eventBus'
import GameHelper from '../../../../../services/gameHelper'
import PlayerIconVue from '../../player/PlayerIcon.vue'
import mentionHelper from '../../../../../services/mentionHelper'
import { inject } from 'vue'
import MenuEventBusEventNames from '../../../../../eventBusEventNames/menu'

export default {
  components: {
    'player-icon': PlayerIconVue
  },
  props: {
    conversation: Object,
    isTruncated: Boolean,
    isFullWidth: Boolean
  },
  setup() {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  methods: {
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    getDateString (date) {
      return GameHelper.getDateString(date)
    },
    getFriendlyColour (colour) {
      return GameHelper.getFriendlyColour(colour)
    },
    openConversation () {
      this.eventBus.emit(MenuEventBusEventNames.OnViewConversationRequested, {
        conversationId: this.conversation._id
      });
    }
  },
  computed: {
    hasLastMessage: function () {
      return this.conversation.lastMessage != null
    },
    hasReadLastMessage: function () {
      return this.hasLastMessage && this.conversation.lastMessage.readBy.find(r => r === this.getUserPlayer()._id)
    },
    lastMessageSender: function () {
      return GameHelper.getPlayerById(this.$store.state.game, this.conversation.lastMessage.fromPlayerId)
    },
    isAllPlayersConversation: function () {
      return this.conversation.participants.length === this.$store.state.game.settings.general.playerLimit
    },
    lastMessage () {
      return mentionHelper.replaceMentionsWithNames(this.conversation.lastMessage.message)
    }
  }
}
</script>

<style scoped>
.container {
    cursor: pointer;
}

.player-icons {
  margin-top: -2px;
}

.truncate {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}
</style>
