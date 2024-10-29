<template>
    <div class="btn-group">
        <button v-if="player.ready" class="btn btn-danger" :class="{'btn-sm':smallButtons}" @click="unconfirmReady()" title="Not ready"><i class="fas fa-times"></i></button>
        <button v-if="!player.ready" class="btn btn-success pulse" :class="{'btn-sm':smallButtons}" @click="confirmReady()" title="End your turn"><i class="fas fa-check"></i></button>
        <button v-if="!player.ready" type="button" :class="{'btn-sm':smallButtons}" class="btn btn-success dropdown-toggle dropdown-toggle-split pulse" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <span class="sr-only">Toggle Dropdown</span>
        </button>
        <div v-if="!player.ready" class="dropdown-menu">
            <a class="dropdown-item" href="javascript:;" @click="confirmReady()">Ready</a>
            <a class="dropdown-item" href="javascript:;" @click="confirmReadyToCycle()">Ready to Cycle</a>
        </div>
    </div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import GameApiService from '../../../../services/api/game'

export default {
    props: {
        smallButtons: Boolean
    },
    methods: {
        async confirmReady () {
            if (!await this.$confirm('End Turn', 'Are you sure you want to end your turn?')) {
                return
            }

            try {
                let response = await GameApiService.confirmReady(this.$store.state.game._id)

                if (response.status === 200) {
                    if (this.isTutorialGame) {
                        this.$toast.success(`You have confirmed your move, please wait while the game processes the tick.`)
                    } else {
                        this.$toast.success(`You have confirmed your move, once all players are ready the game will progress automatically.`)
                    }

                    this.player.ready = true
                }
            } catch (err) {
                console.error(err)
            }
        },
        async confirmReadyToCycle () {
            if (!await this.$confirm('End Cycle', 'Are you sure you want to end your turn up to the end of the current galactic cycle?')) {
                return
            }

            try {
                let response = await GameApiService.confirmReadyToCycle(this.$store.state.game._id)

                if (response.status === 200) {
                    if (this.isTutorialGame) {
                        this.$toast.success(`You have confirmed your move, please wait while the game processes the tick.`)
                    } else {
                        this.$toast.success(`You have confirmed your move, once all players are ready the game will progress automatically.`)
                    }

                    this.player.ready = true
                    this.player.readyToCycle = true
                }
            } catch (err) {
                console.error(err)
            }
        },
        async unconfirmReady () {
            try {
                let response = await GameApiService.unconfirmReady(this.$store.state.game._id)

                if (response.status === 200) {
                    this.player.ready = false
                    this.player.readyToCycle = false
                }
            } catch (err) {
                console.error(err)
            }
        }
    },
    computed: {
        player () {
            return GameHelper.getUserPlayer(this.$store.state.game)
        }
    }
}
</script>

<style scoped>

</style>
