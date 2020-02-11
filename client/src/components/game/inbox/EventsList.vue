<template>
<div>
    <div class="container">
        <button class="btn btn-primary float-right">Mark All Read</button>
        <span>Click on an event to mark is as read.</span>
    </div>

    <div class="mt-4"> 
        <events-list-item :game="game" />
    </div>
</div>
</template>

<script>
import EventsListItemVue from './EventsListItem'

export default {
  components: {
      'events-list-item': EventsListItemVue
  },
  props: {
    game: Object
  },
  data: function() {
      return {
        events: []
      }
  },
}
</script>

<style scoped>
</style>