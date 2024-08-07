<template>
<div class="menu-page container">
    <menu-title title="Settings" @onCloseRequested="onCloseRequested"/>

    <game-settings :game="game"/>
</div>
</template>

<script>
import MenuTitle from '../MenuTitle.vue'
import GameSettings from './GameSettings.vue'

export default {
  components: {
    'menu-title': MenuTitle,
    'game-settings': GameSettings
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    }
  },
  computed: {
    game () {
      return this.$store.state.game
    }
  }
}
</script>

<style scoped>
</style>
