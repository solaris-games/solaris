<template>
<div class="menu-page container">
    <menu-title title="Spectators" @onCloseRequested="onCloseRequested"/>

    <loading-spinner :loading="isLoading"/>

    <div class="row text-center mt-2" v-if="!isLoading && !spectators.length">
      <p class="text-warning mb-1">This game has no spectators.</p>
    </div>

    <div class="row mt-2" v-if="!isLoading">
        <spectator v-for="s in spectators" :spectator="s" :key="s._id"
          @onSpectatorUninvited="loadSpectators"/>
    </div>

    <p class="text-info"><i>Spectators will view the game from the perspective of the players they are spectating. For more information, see the wiki.</i></p>

    <invite-spectator @onSpectatorsInvited="loadSpectators" class="pb-2"/>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle.vue'
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import InviteSpectator from './InviteSpectator.vue'
import Spectator from './Spectator.vue'
import SpectatorApiService from '../../../../services/api/spectator'

export default {
  components: {
    'menu-title': MenuTitle,
    'loading-spinner': LoadingSpinner,
    'invite-spectator': InviteSpectator,
    'spectator': Spectator
  },
  data () {
    return {
      isLoading: false,
      spectators: []
    }
  },
  mounted () {
    this.loadSpectators()
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    async loadSpectators () {
      try {
        this.isLoading = true

        let response = await SpectatorApiService.list(this.$store.state.game._id)

        if (response.status === 200) {
          this.spectators = response.data
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoading = false
    }
  }
}
</script>

<style scoped>
</style>
