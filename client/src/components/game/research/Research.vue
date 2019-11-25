<template>
<div class="container bg-secondary">
    <h3 class="pt-2">Research</h3>

    <selection :game="game"/>

    <h4>Research Progress</h4>
    <progress-summary :game="game"/>
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
