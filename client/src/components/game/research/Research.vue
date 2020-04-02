<template>
<div class="container">
    <h3 class="pt-2">Research</h3>

    <p>Each point of science on your stars contributes 1 point of research every tick towards your chosen technology.</p>

    <selection :game="game"/>

    <h4>Research Progress</h4>

    <progress-summary :game="game"/>

    <!-- TODO: Explanations of each research type -->
</div>
</template>

<script>
import Selection from './Selection'
import ProgressSummary from './ProgressSummary'

export default {
  components: {
    'selection': Selection,
    'progress-summary': ProgressSummary
  },
  props: {
    game: Object
  }
}
</script>

<style scoped>
</style>
