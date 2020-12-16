<template>
<div class="container bg-primary pt-1" 
  :class="{'bg-light': isAllPlayersConversation, 'bg-warning':conversation.unreadCount}"
    @click="openConversation">
    <div class="row pb-1">
        <div class="col">
          <span>
              {{conversation.name}}
          </span>
        </div>
        <div class="col-auto">
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
    <div class="row bg-secondary mt-0">
        <div class="col-12" v-if="hasLastMessage">
            <p class="mt-2 mb-2" :class="{'truncate':isTruncated}">
              <player-icon :player="lastMessageSender"/>
              {{conversation.lastMessage.message}}
            </p>
        </div>
        <div class="col-12" v-if="hasLastMessage">
            <small class="float-right mb-2"><i>{{getDateString(conversation.lastMessage.sentDate)}}</i></small>
        </div>
        <div class="col-12" v-if="!hasLastMessage">
            <p class="mt-2 mb-2">No messages.</p>
        </div>
    </div>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import moment from 'moment'
import PlayerIconVue from '../../player/PlayerIcon.vue'

export default {
  components: {
    'player-icon': PlayerIconVue
  },
  props: {
    conversation: Object,
    isTruncated: Boolean,
    isFullWidth: Boolean
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
      this.$emit('onOpenConversationRequested', this.conversation._id)
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
    }
  }
}
</script>

<style scoped>
.container {
    cursor: pointer;
}

.truncate {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}
</style>
