<template>
  <div class="row">
    <div class="col">
        <h5><i class="fas fa-user me-1"></i>{{spectator.username}}</h5>
        <ul>
            <li v-for="player in players" :key="player._id">
                <span>{{player.alias}}</span>
                <i class="fas fa-times text-danger ms-1 pointer" title="Remove spectator"
                    v-if="!isLoading && userPlayer && userPlayer._id === player._id"
                    @click="uninvite"></i>
                <i class="fas fa-sync ms-1" v-if="isLoading"/>
            </li>
        </ul>
    </div>
  </div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import SpectatorApiService from '../../../../services/api/spectator'

export default {
  props: {
      spectator: Object
  },
  data () {
      return {
          isLoading: false
      }
  },
  methods: {
      async uninvite () {
        this.isLoading = true

        try {
            let response = await SpectatorApiService.uninvite(this.$store.state.game._id, this.spectator._id)

            if (response.status === 200) {
                this.$toast.success(`You uninvited ${this.spectator.username} from spectating you in this game.`)

                this.$emit('onSpectatorUninvited', this.spectator)
            }
        } catch (err) {
            console.log(err)
        }

        this.isLoading = false
      }
  },
  computed: {
      players () {
            return this.$store.state.game.galaxy.players.filter(p => this.spectator.playerIds.includes(p._id))
      },
      userPlayer () {
          return GameHelper.getUserPlayer(this.$store.state.game)
      }
  }
}
</script>

<style scoped>
.pointer {
    cursor: pointer;
}
</style>
