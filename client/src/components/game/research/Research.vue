<template>
<div class="container">
    <menu-title title="Research" @onCloseRequested="onCloseRequested"/>

    <p>Each point of science on your stars contributes 1 point of research every tick towards your chosen technology.</p>

    <selection :game="game"/>

    <h4>Research Progress</h4>

    <progress-summary :game="game"/>

    <!-- TODO: Explanations of each research type -->
</div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import Selection from './Selection'
import ProgressSummary from './ProgressSummary'

export default {
  components: {
    'menu-title': MenuTitle,
    'selection': Selection,
    'progress-summary': ProgressSummary
  },
  props: {
    game: Object
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    }
  }
}
</script>

<style scoped>
</style>
