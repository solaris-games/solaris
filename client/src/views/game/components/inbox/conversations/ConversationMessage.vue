<template>
  <div class="container message-container"
    :class="{'left-message': !isFromUserPlayer, 'right-message': isFromUserPlayer,
            'bg-dark': !message.pinned, 'bg-secondary': message.pinned}">
    <div class="row mt-0" v-if="fromPlayer" :style="{'background-color': fromColour}" style="height:6px;"></div>
    <div class="row mt-0" v-if="message">
      <div class="col mt-1 mb-0">
        <span class="pointer" @click="onOpenPlayerDetailRequested">
          <player-icon class="me-2" v-if="message.fromPlayerId" :playerId="message.fromPlayerId"/>
          <strong>{{message.fromPlayerAlias}}</strong>
        </span>
      </div>
      <div class="col-auto thumbtack" v-if="conversation.createdBy">
        <conversation-message-pin :conversationId="conversation._id" :messageId="message._id" :pinned="message.pinned" @onPinned="onPinned" @onUnpinned="onUnpinned" />
      </div>
      <conversation-message-context-menu :conversation="conversation" :message="message" @onOpenReportPlayerRequested="onOpenReportPlayerRequested" :user-player="getUserPlayer()" />
      <div class="col-12">
        <p class="mt-0 mb-0">
          <i class="fas fa-envelope me-2" v-if="!userPlayerHasReadMessage"></i>
          <small><em>{{dateText}}</em></small>
        </p>
      </div>
    </div>
    <div class="row mt-0">
        <div class="col">
            <p class="mt-2 mb-2 linebreaks" ref="messageElement" />
        </div>
    </div>
  </div>
</template>

<script>
import GameHelper from '../../../../../services/gameHelper'
import PlayerIconVue from '../../player/PlayerIcon.vue'
import ConversationMessagePinVue from './ConversationMessagePin.vue'
import mentionHelper from '../../../../../services/mentionHelper'
import ConversationMessageContextMenu from "./ConversationMessageContextMenu.vue";
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import { inject } from 'vue';

export default {
  components: {
    'conversation-message-context-menu': ConversationMessageContextMenu,
    'player-icon': PlayerIconVue,
    'conversation-message-pin': ConversationMessagePinVue
  },
  props: {
    conversation: Object,
    message: Object
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  mounted () {
    const onStarClicked = (id) => {
      this.panToStar(id)

      if (this.$isMobile()) {
        this.$emit('onMinimizeConversationRequested')
      }
    }

    const onPlayerClicked = (id) => this.$emit('onOpenPlayerDetailRequested', id)

    mentionHelper.renderMessageWithMentionsAndLinks(this.$refs.messageElement, this.message.message, onStarClicked, onPlayerClicked)
  },
  methods: {
    onOpenReportPlayerRequested (e) {
      this.$emit('onOpenReportPlayerRequested', e);
    },
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    getFriendlyColour (colour) {
      return GameHelper.getFriendlyColour(colour)
    },
    onOpenPlayerDetailRequested () {
      this.$emit('onOpenPlayerDetailRequested', this.message.fromPlayerId)
    },
    onPinned () {
      this.message.pinned = true
    },
    onUnpinned () {
      this.message.pinned = false
    },
    panToStar (id) {
      const star = GameHelper.getStarById(this.$store.state.game, id)

      if (star) {
        this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: star });
      } else {
        this.$toast.error(`The location of the star is unknown.`)
      }
    },
  },
  computed: {
    isFromUserPlayer: function () {
      return this.message.fromPlayerId === this.getUserPlayer()._id
    },
    fromPlayer: function () {
      return GameHelper.getPlayerById(this.$store.state.game, this.message.fromPlayerId)
    },
    userPlayerHasReadMessage: function () {
      return this.message.readBy.find(x => this.getUserPlayer()._id === x) != null
    },
    dateText: function () {
      const date = GameHelper.getDateString(this.message.sentDate)
      let tick = ''
      if (this.message.sentTick || this.message.sentTick === 0) {
        tick = ` (tick ${this.message.sentTick})`
      }
      return date + tick
    },
    fromColour () {
      return this.$store.getters.getColourForPlayer(this.fromPlayer._id).value
    }
  }
}
</script>

<style scoped>
.left-message {
  width: 85%;
  margin-left:0;
}

.right-message {
  width: 85%;
  margin-right:0;
}

.pointer {
  cursor: pointer;
}

.linebreaks {
  white-space: break-spaces;
  word-wrap: break-word;
}

.thumbtack {
  display: none;
}

.message-container:hover .thumbtack {
  display: block;
}
</style>
