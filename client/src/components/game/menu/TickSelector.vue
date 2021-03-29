<template>
<span class="user-select-none">
    <i class="fas pointer" :class="{'fa-times text-danger': gameTick <= 1,'fa-arrow-left':gameTick > 1}" @click="loadPreviousTick" :disabled="isLoading"></i>
    <span class="pointer d-inline-block d-md-none ml-2 mr-2" @click="loadCurrentTick"><i class="fas fa-stopwatch mr-1"></i>{{gameTick}}</span>
    <span class="pointer d-none d-md-inline-block ml-2 mr-2" @click="loadCurrentTick">Tick {{gameTick}}</span>
    <i class="fas pointer" :class="{'fa-times text-danger': gameTick >= stateTick,'fa-arrow-right':gameTick < stateTick}" @click="loadNextTick" :disabled="isLoading"></i>
</span>
</template>

<script>
import GameApiService from '../../../services/api/game'

export default {
  data () {
    return {
        isLoading: false
    }
  },
  methods: {
    async loadCurrentTick () {
        if (this.gameTick === this.stateTick || this.isLoading) {
            return
        }

        this.isLoading = true

        let game = this.$store.state.game

        try {
            let response = await GameApiService.getGameGalaxy(game._id, this.stateTick)

            if (response.status === 200) {
                this.$store.commit('setGame', response.data)
            }
        } catch (err) {
            console.error(err)
        }
        
        this.isLoading = false
    },
    async loadPreviousTick () {
        if (this.gameTick <= 1 || this.isLoading) {
            return
        }

        this.isLoading = true

        let game = this.$store.state.game

        try {
            let response = await GameApiService.getGameGalaxy(game._id, game.state.tick - 1)

            if (response.status === 200) {
                this.$store.commit('setGame', response.data)
            }
        } catch (err) {
            console.error(err)
        }
        
        this.isLoading = false
    },
    async loadNextTick () {
        if (this.gameTick >= this.stateTick || this.isLoading) {
            return
        }

        this.isLoading = true

        let game = this.$store.state.game

        try {
            let response = await GameApiService.getGameGalaxy(game._id, game.state.tick + 1)

            if (response.status === 200) {
                this.$store.commit('setGame', response.data)
            }
        } catch (err) {
            console.error(err)
        }
        
        this.isLoading = false
    }
  },
  computed: {
      stateTick: function () {
          return this.$store.state.tick
      },
      gameTick: function () {
          return this.$store.state.game.state.tick
      }
  }
}
</script>

<style scoped>
.pointer {
  cursor:pointer;
}

.user-select-none {
    user-select: none;
}
</style>
