<template>
<div>
    <div class="btn-group" v-if="game.state.startDate && userPlayer.defeated">
        <button class="btn btn-danger" @click="concedeDefeat()" title="Concede Defeat">
            <i class="fas fa-skull-crossbones"></i> {{isTutorialGame ? 'Quit Tutorial' : 'Concede Defeat'}}
        </button>
        <button type="button" class="btn btn-success dropdown-toggle dropdown-toggle-split pulse" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" v-if="!isTutorialGame">
            <span class="sr-only">Toggle Dropdown</span>
        </button>
        <div class="dropdown-menu" v-if="!isTutorialGame">
            <a class="dropdown-item" href="javascript:;" @click="concedeDefeat(false)">Concede Defeat</a>
            <a class="dropdown-item" href="javascript:;" @click="concedeDefeat(true)">Concede Defeat - Open Slot</a>
        </div>
    </div>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import GameApiService from '../../../../services/api/game'

export default {
    data () {
        return {
            isConcedingDefeat: false
        }
    },
    methods: {
        async concedeDefeat (openSlot) {
            let message = 'Are you sure you want to concede defeat in this game?'

            if (this.isTutorialGame) {
                message = 'Are you sure you want to exit the tutorial? All progress will be lost.'
            }

            if (openSlot) {
                message += ' Your slot will be open for another player to fill.'
            }

            if (!await this.$confirm('Concede Defeat', message)) {
                return
            }
            
            this.isConcedingDefeat = true

            try {
                let response = await GameApiService.concedeDefeat(this.$store.state.game._id, openSlot)

                if (response.status === 200) {
                    AudioService.quit()

                    if (!this.isTutorialGame) {
                        this.$toasted.show(`You have conceded defeat, better luck next time.`, { type: 'error' })
                    }

                    router.push({ name: 'main-menu' })
                }
            } catch (err) {
                console.error(err)
            }

            this.isConcedingDefeat = false
        }
    },
    computed: {
        userPlayer () {
            return GameHelper.getUserPlayer(this.$store.state.game)
        },
        isTutorialGame () {
            return GameHelper.isTutorialGame(this.$store.state.game)
        }
    }
}
</script>

<style scoped>

</style>