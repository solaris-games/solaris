<template>
<div class="bg-warning container" v-if="isSpectating">
    <div class="row pt-2 pb-2">
        <div class="col">
            <p class="mt-0 mb-0">You are spectating this game.</p>
        </div>
    </div>
    <div class="row pb-2" v-if="isSpectatingDarkMode">
        <div class="col">
            <p class="mt-0 mb-0">This is a <strong>dark mode</strong> game, no stars will be visible to you unless you have been invited to spectate a player.</p>
        </div>
    </div>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

export default {
    computed: {
        isSpectating () {
            return GameHelper.isUserSpectatingGame(this.$store.state.game)
        },
        isSpectatingDarkMode () {
            return (GameHelper.isDarkMode(this.$store.state.game) || GameHelper.isDarkFogged(this.$store.state.game)) && !this.$store.state.game.galaxy.stars.length
        }
    }
}
</script>

<style scoped>
</style>
