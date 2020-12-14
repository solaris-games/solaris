<template>
<div class="participant-container">
  <p>
    <span v-for="participant in conversation.participants" :key="participant" class="mr-2">
      <player-icon :player="getPlayer(participant)"/>

      {{getPlayer(participant).alias}}
    </span>
  </p>
  <!-- {{getPlayersString()}} -->
  <!-- <div v-for="participant in conversation.participants" :key="participant">
    {{getPlayer(participant).alias}}
  </div> -->
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import PlayerIconVue from '../../player/PlayerIcon.vue'

export default {
  components: {
    'player-icon': PlayerIconVue
  },
  props: {
    conversation: Object
  },
  methods: {
    getPlayer (playerId) {
      return GameHelper.getPlayerById(this.$store.state.game, playerId)
    },
    getPlayersString () {
      return this.conversation.participants.map(p => this.getPlayer(p).alias).join(', ')
    }
  }
}
</script>

<style scoped>

</style>
