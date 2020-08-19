<template>
<!-- :style="{'background-image': 'linear-gradient(to right, ' + colour + ', #375a7f 50%)'}" -->
<div class="container bg-primary pt-2" @click="openConversation">
    <div class="row">
        <div class="col">
            <span v-if="message && !message.read && getUserPlayer()._id === message.toPlayerId" class="mr-1">
                <i class="fas fa-envelope"></i>
            </span>
            <span>
                <i class="fas fa-circle" :style="{'color': colour}"></i>
                {{sender.alias}}
            </span>
        </div>
        <div class="col-auto" v-if="message">
            <small>{{getDateString(message.sentDate)}}</small>
        </div>
    </div>
    <div class="row bg-secondary mt-2">
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
      date = moment(date).utc().toDate()

      let dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      let monthOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

      return `${dayOfWeek[date.getDay()]} ${date.getDate()} ${monthOfYear[date.getMonth()]} ${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`
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
