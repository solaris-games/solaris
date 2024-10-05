<template>

<div>
    <div @click="toggleDisplay" class="pointer">
        <span class="me-1">
            <i class="fas fa-stopwatch"></i>
        </span>
        <span class="d-none d-md-inline-block me-1">
            Tick
        </span>
        <span class="d-none d-sm-inline-block user-select-none me-1">
            {{tick}}
        </span>
        <span>
            <i class="fas" :class="{'fa-chevron-down':!display,'fa-chevron-up':display}"></i>
        </span>
    </div>

    <div class="tick-form container mt-1 p-3" :class="{'header-bar-bg':!$isHistoricalMode(),'bg-dark':$isHistoricalMode()}" v-if="display">
        <div class="row mt-0 pt-2 pb-2 g-0">
            <div class="col-12 mb-1">
                <input type="range" :min="minimumTick" :max="stateTick" class="slider" v-model="tick" @change="onRequestedTickChanged" :disabled="isLoading">
            </div>
			<div class="col-5">
				<button class="btn btn-sm btn-secondary" @click="loadPreviousTick(6)" :disabled="isLoading || tick <= minimumTick" title="Jump back 6 ticks">
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button class="btn btn-sm btn-secondary ms-1" @click="loadPreviousTick(1)" :disabled="isLoading || tick <= minimumTick" title="Previous tick">
                    <i class="fas fa-angle-left"></i> Prev
                </button>
			</div>
            <div class="col-2 text-center">
                {{tick}}
            </div>
			<div class="col-5 text-end">
				<button class="btn btn-sm btn-secondary" @click="loadNextTick(1)" :disabled="isLoading || tick >= stateTick" title="Next tick">
                    Next <i class="fas fa-angle-right"></i>
                </button>
                <button class="btn btn-sm btn-secondary ms-1" @click="loadNextTick(6)" :disabled="isLoading || tick >= stateTick" title="Jump forward 6 ticks">
                    <i class="fas fa-angle-double-right"></i>
                </button>
			</div>
        </div>
    </div>
</div>
</template>

<script>
import GameApiService from '../../../../services/api/game'
import eventBus from '../../../../eventBus'

export default {
  data () {
    return {
        isLoading: false,
        display: false,
        tick: 0
    }
  },
  mounted () {
      this.tick = this.stateTick;
      eventBus.$on('onGameTick', this.onGameTick);
  },
  methods: {
    toggleDisplay () {
        this.display = !this.display
    },
    async onRequestedTickChanged () {
        if (this.isLoading || this.tick < 1 || this.tick > this.stateTick || this.tick === this.gameTick) {
            return
        }

        this.isLoading = true

        let game = this.$store.state.game

        try {
            let response = await GameApiService.getGameGalaxy(game._id, this.tick)

            if (response.status === 200) {
                this.$store.commit('setGame', response.data)
                this.tick = response.data.state.tick
            }
        } catch (err) {
            console.error(err)
        }
        
        this.isLoading = false
    },
    async loadCurrentTick () {
        this.tick = this.stateTick
        await this.onRequestedTickChanged()
    },
    async loadPreviousTick (ticks) {
        this.tick = Math.max(this.minimumTick, this.tick - ticks)
        await this.onRequestedTickChanged()
    },
    async loadNextTick (ticks) {
        this.tick = Math.min(this.stateTick, this.tick + ticks)
        await this.onRequestedTickChanged()
    },
    onGameTick(e) {
      if (this.tick === this.gameTick - 1) {
        this.tick = this.gameTick;
      }
    }
  },
  computed: {
      stateTick: function () {
          return this.$store.state.tick
      },
      gameTick: function () {
          return this.$store.state.game.state.tick
      },
      minimumTick: function () {
          return this.$store.state.game.state.timeMachineMinimumTick ?? 1;
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

.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 15px;
  border-radius: 5px;  
  background: #444;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px;
  height: 25px;
  border-radius: 50%; 
  background: #00bc8c;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #00bc8c;
  cursor: pointer;
}

.tick-form {
    z-index: 1;
    position:absolute;
    width:300px;
    left:0px;
}

@media screen and (max-width: 473px) {
    .tick-form {
        left: 0px;
    }
}
</style>
