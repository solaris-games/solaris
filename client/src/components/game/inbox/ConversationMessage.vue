<template>
<div class="container bg-primary"
    :class="{'left-message': !isFromUserPlayer, 'right-message': isFromUserPlayer}">
    <div class="row mt-0" :style="{'background-color': colour}" style="height:6px;"></div>
    <div class="row mt-0 bg-secondary" v-if="message">
      <div class="col mt-1">
        <span>
          <strong>{{sender.alias}}</strong>
        </span>
      </div>
      <div class="col-auto">
        <p class="mt-0 mb-0">
          <i class="fas fa-envelope mr-2" v-if="!message.read && getUserPlayer()._id === message.toPlayerId"></i>
          <small><em>{{getDateString(message.sentDate)}}</em></small>
        </p>
      </div>
    </div>
    <div class="row bg-secondary mt-0">
        <div class="col">
            <p class="mt-2 mb-2" v-if="message">{{message.message}}</p>
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
    isUnread: Boolean
  },
  methods: {
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    getDateString (date) {
      return GameHelper.getDateString(date)
    }
  },
  computed: {
    isFromUserPlayer: function () {
      return this.sender._id === this.getUserPlayer()._id
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
</style>
