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

    <div class="pt-2">
        <diplomacy-list-item v-for="conversation in conversations" v-bind:key="conversation.alias" :game="game" :conversation="conversation" />
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
  data () {
    return {
      conversations: [
        {
          alias: 'Player 1',
          lastMessage: 'Hello world',
          lastMessageDate: new Date()
        },
        {
          alias: 'Player 2',
          lastMessage: 'Hello world',
          lastMessageDate: new Date()
        },
        {
          alias: 'Player 3',
          lastMessage: 'Hello world',
          lastMessageDate: new Date()
        },
        {
          alias: 'Player 4',
          lastMessage: 'Hello world',
          lastMessageDate: new Date()
        }
      ]
    }
  }
}
</script>

<style scoped>
</style>
