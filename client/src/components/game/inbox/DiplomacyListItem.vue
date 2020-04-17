<template>
<div class="container bg-primary pt-2 pb-1 mb-2">
    <p class="float-right"><small>{{getDateString(conversation.lastMessageDate)}}</small></p>
    <div class="row">
        <div class="col pl-2 pr-2">
            <span><i class="fas fa-user-circle"></i> {{conversation.alias}}</span>

            <p class="mt-2 mb-1">{{conversation.lastMessage}}</p>
        </div>
    </div>
</div>
</template>

<script>
export default {
  components: {
  },
  props: {
    game: Object,
    conversation: Object
  },
  methods: {
      getDateString (date) {
          let dayOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
          let monthOfYear = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

          return `${dayOfWeek[date.getDay()]} ${date.getDate()} ${monthOfYear[date.getMonth()]} ${date.getHours()}:${date.getMinutes()}`
      }
  }
}
</script>

<style scoped>
.container {
    cursor: pointer;
}
</style>
