<template>
    <div class="locked-game-overlay" v-if="!userCanJoinGame" title="Finish a 'New Player Game' to unlock this game mode">
        <div class="locked-game-overlay-container text-center">
            <i class="fas fa-lock"></i>
            <p class="lock-text ps-2 pe-2 pt-3"><small>Finish a New Player Game to unlock</small></p>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        game: Object
    },
  computed: {
    userCanJoinGame () {
        return this.userIsEstablishedPlayer || this.game.settings.general.playerType === 'all'
    },
    userIsEstablishedPlayer () {
        return this.$store.state.userIsEstablishedPlayer == null ? true : this.$store.state.userIsEstablishedPlayer
    }
  }
}
</script>

<style scoped>
.locked-game-overlay {
    position: absolute !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0,0,0,0.5);
}

.fa-lock {
    font-size: 35px;
}

.lock-text {
    display: none;
}

.locked-game-overlay:hover .lock-text {
    display: block;
}

.locked-game-overlay:hover .fa-lock {
    display: none;
}
</style>