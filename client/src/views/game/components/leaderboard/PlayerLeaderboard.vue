<template>
  <div class="row">
    <div class="table-responsive p-0">
      <table class="table table-sm table-striped">
        <tbody>
          <leaderboard-row v-for="player in sortedPlayers" :key="player._id" :player="player" :show-team-names="true" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested" />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import LeaderboardRow from './LeaderboardRow.vue';

export default {
  components: {
    'leaderboard-row': LeaderboardRow
  },

  data () {
    return {
      players: []
    }
  },
  mounted () {
    this.players = this.$store.state.game.galaxy.players
  },
  methods: {
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    }
  },

  computed: {
    game () {
      return this.$store.state.game
    },
    sortedPlayers () {
      return GameHelper.getSortedLeaderboardPlayerList(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
table tr {
  height: 59px;
}

.table-sm td {
  padding: 0;
}

@media screen and (max-width: 576px) {
  table tr {
    height: 45px;
  }
}
</style>
