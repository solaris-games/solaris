<template>
<!-- :style="{'background-image': 'linear-gradient(to left, ' + colour + ', #375a7f 100%)'}" -->
<!-- :style="{'background-color': colour}" -->
<div class="container bg-primary pt-1"
    @click="openConversation">
    <div class="row">
        <div class="col">
          <span>
              <i class="fas fa-circle" :style="{'color': colour}"></i>
              {{sender.alias}}
          </span>
        </div>
        <div class="col-auto" v-if="message">
            <i class="fas fa-envelope mr-2" v-if="!message.read && getUserPlayer()._id === message.toPlayerId"></i>
            <small>{{getDateString(message.sentDate)}}</small>
        </div>
    </div>
    <div class="row mt-1" :style="{'background-color': colour}" style="height:6px;"></div>
    <div class="row bg-secondary mt-0">
        <div class="col">
            <p class="mt-2 mb-2" v-if="message" :class="{'truncate':isTruncated}">{{message.message}}</p>
            <p class="mt-2 mb-2" v-if="!message">No messages.</p>
        </div>
    </div>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import moment from 'moment'

export default {
  components: {
  },
  props: {
    message: Object,
    sender: Object,
    colour: String,
    isUnread: Boolean,
    isTruncated: Boolean
  },
  methods: {
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    getDateString (date) {
      return GameHelper.getDateString(date)
    },
    openConversation () {
      this.$emit('onConversationOpenRequested', this.sender._id)
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
