<template>
<!-- :style="{'background-image': 'linear-gradient(to left, ' + colour + ', #375a7f 100%)'}" -->
<!-- :style="{'background-color': colour}" -->
<div class="container bg-primary pt-1"
    @click="openConversation">
    <div class="row pb-1">
        <div class="col">
          <span>
              <strong>{{conversation.name}}</strong>
          </span>
        </div>
        <div class="col-auto" v-if="hasReadLastMessage">
            <i class="fas fa-envelope mr-2" v-if="!hasReadLastMessage"></i>
            <small>{{getDateString(conversation.lastMessage.sentDate)}}</small>
        </div>
    </div>
    <!-- <div class="row mt-1" :style="{'background-color': colour}" style="height:6px;"></div> -->
    <div class="row bg-secondary mt-0">
        <div class="col">
            <p class="mt-2 mb-2" v-if="hasLastMessage" :class="{'truncate':isTruncated}">
              <i class="fas" :class="{'fa-circle': lastMessageSender.shape === 'circle','fa-square': lastMessageSender.shape === 'square'}" :style="{'color': getFriendlyColour(lastMessageSender.colour)}"></i>
              {{conversation.lastMessage.message}}
            </p>
            <p class="mt-2 mb-2" v-if="!hasLastMessage">No messages.</p>
        </div>
    </div>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import moment from 'moment'

export default {
  components: {
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
      this.$emit('onConversationOpenRequested', this.conversation._id)
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
