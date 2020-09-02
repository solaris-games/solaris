<template>
<div class="menu-page container">
    <menu-title title="Research" @onCloseRequested="onCloseRequested"/>

    <p>Each point of science on your stars contributes 1 point of research every tick towards your chosen technology.</p>

    <selection/>

    <h4 class="mt-2">Research Progress</h4>

    <progress-summary/>

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
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    }
  }
}
</script>

<style scoped>
</style>
