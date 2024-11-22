<template>
  <loading-spinner :loading="!game"/>

  <div v-if="game">
    <table class="table table-striped table-hover">
      <tbody>
      <tr v-for="player of filledSlots">
        <td>{{ player.alias }}</td>
        <td>
          <button class="btn btn-warning" @click="kickPlayer(player)"><i class="fas fa-hammer"></i> Kick</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import LoadingSpinner from '../components/LoadingSpinner.vue'
import gameService from '../../services/api/game'

export default {
  components: {
    'loading-spinner': LoadingSpinner,
  },
  props: {
    game: Object,
  },
  methods: {
    async kickPlayer(player) {
      if (await this.$confirm(`Kick Player`, `Do you really want to kick player ${player.alias}?`)) {
        try {
          await gameService.kickPlayer(this.game._id, player._id);

          this.$toast.info('Player kicked');
        } catch (e) {
          this.$toast.error(e?.response?.data?.errors?.join(", "));
        }

        this.$emit('onGameModified')
      }
    }
  },
  computed: {
    filledSlots() {
      return this.game.galaxy.players.filter(p => !p.isOpenSlot);
    }
  }
}
</script>
<style scoped>
</style>
