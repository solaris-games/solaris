<template>
<div class="container bg-primary pt-2 pb-1 mb-2" @click="openConversation">
    <p class="float-right" v-if="message">
        <small>{{getDateString(message.sentDate)}}</small>
    </p>
    <div>
        <span><i class="fas fa-user-circle"></i> {{sender.alias}}</span>

        <p class="mt-2 mb-1" v-if="message">{{message.message}}</p>
        <p class="mt-2 mb-1" v-if="!message">No messages.</p>
    </div>
</div>
</template>

<script>
export default {
  components: {
  },
  props: {
    game: Object,
    message: Object,
    sender: Object
  },
  methods: {
      getDateString (date) {
          date = new Date(date)
          
          let dayOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
          let monthOfYear = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

          return `${dayOfWeek[date.getDay()]} ${date.getDate()} ${monthOfYear[date.getMonth()]} ${date.getHours()}:${date.getMinutes()}`
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
</style>
