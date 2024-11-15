<template>
<div class="menu-page container">
    <menu-title title="Research" @onCloseRequested="onCloseRequested"/>

    <p><small>Each point of science on your stars contributes <span class="text-info">{{game.constants.research.sciencePointMultiplier}} point<span v-if="game.constants.research.sciencePointMultiplier > 1">s</span></span> of research every tick towards your chosen technology.</small></p>

    <selection/>

    <h4 class="mt-2">Research Progress</h4>

    <progress-summary/>

    <!-- TODO: Explanations of each research type -->
</div>
</template>

<script>
import MenuTitle from '../MenuTitle.vue'
import Selection from './Selection.vue'
import ProgressSummary from './ProgressSummary.vue'

export default {
  components: {
    'menu-title': MenuTitle,
    'selection': Selection,
    'progress-summary': ProgressSummary
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
