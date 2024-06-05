<template>
<div class="participant-container">
  <p v-if="isPartialPlayers" class="mb-2">
    <small>
      <span v-for="participant in conversation.participants" :key="participant" class="me-2 pointer" @click="onOpenPlayerDetailRequested(participant)">
        <player-icon :playerId="getPlayer(participant)._id" class="me-1"/>

        {{getPlayer(participant).alias}}
      </span>
    </small>
  </p>
  <div v-if="!isPartialPlayers && !isOneVsOne" class="text-info mb-1">
    <p class="mb-0 mt-1">
      <i>This conversation is for <strong>all</strong> players.</i>
    </p>
    <p>
      <router-link :to="{ name: 'guidelines' }">Community Guidelines</router-link>
    </p>
  </div>
  <!-- {{getPlayersString()}} -->
  <!-- <div v-for="participant in conversation.participants" :key="participant">
    {{getPlayer(participant).alias}}
  </div> -->
</div>
</template>

<script>
import GameHelper from '../../../../../services/gameHelper'
import PlayerIconVue from '../../player/PlayerIcon.vue'

export default {
  components: {
    'player-icon': PlayerIconVue
  },
  props: {
    conversation: Object
  },
  methods: {
    onOpenPlayerDetailRequested (playerId) {
      this.$emit('onOpenPlayerDetailRequested', playerId)
    },
    getPlayer (playerId) {
      return GameHelper.getPlayerById(this.$store.state.game, playerId)
    },
    getPlayersString () {
      return this.conversation.participants.map(p => this.getPlayer(p).alias).join(', ')
    }
  },
  computed: {
    isPartialPlayers: function () {
      return this.conversation.participants.length !== this.$store.state.game.galaxy.players.length
    },
    isOneVsOne: function () {
      return this.$store.state.game.settings.general.playerLimit === 2
    }
  }
}
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
