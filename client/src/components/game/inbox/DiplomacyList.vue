<template>
<div>
    <div class="container">
        <button class="btn btn-primary"><i class="fas fa-envelope"></i></button>
        <button class="btn btn-primary ml-1"><i class="fas fa-sync"></i></button>
        <button class="btn btn-primary float-right">Mark All Read</button>
    </div>

    <div class="text-center pt-2" v-if="!conversations.length">
        No Messages
    </div>

    <div> 
        <diplomacy-list-item :game="game" />
        <diplomacy-list-item :game="game" />
        <diplomacy-list-item :game="game" />
        <diplomacy-list-item :game="game" />
    </div>
</div>
</template>

<script>
import DiplomacyListItemVue from './DiplomacyListItem'

export default {
  components: {
      'diplomacy-list-item': DiplomacyListItemVue
  },
  props: {
    game: Object
  },
  data: function() {
      return {
        conversations: []
      }
  },
}
</script>

<style scoped>
</style>